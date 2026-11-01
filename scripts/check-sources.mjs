#!/usr/bin/env node
/**
 * Weekly source check. Fetches the official pages the site depends on, reduces each to its
 * readable text and writes one file per page to --out (default: source-snapshots/). The workflow
 * compares them with the previous run and opens an issue when something changed. Also checks
 * that every official URL in src/ still answers, and prints a Markdown report.
 *
 * Usage: node scripts/check-sources.mjs [--out <dir>] [--report <file>]
 * Exit code: 0 all fine, 1 a watched page could not be fetched (snapshots incomplete),
 * 2 snapshots complete but a link is broken or redirects.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

/** Pages whose content the site restates. Keep in sync with src/config/status.ts and pathwaySources.ts. */
export const WATCHED = [
  { id: 'uhr-medborgarskapsprovet', url: 'https://www.uhr.se/medborgarskapsprovet/' },
  { id: 'uhr-om-provet', url: 'https://www.uhr.se/medborgarskapsprovet/om-medborgarskapsprovet/' },
  { id: 'uhr-utbildningsmaterial', url: 'https://www.uhr.se/medborgarskapsprovet/utbildningsmaterial/' },
  { id: 'uhr-fragor-och-svar', url: 'https://www.uhr.se/medborgarskapsprovet/fragor-och-svar/' },
  {
    id: 'uhr-resultat-samhallskunskap-2026-08',
    url: 'https://www.uhr.se/om-uhr/nyheter/2026-nyheter/resultaten-fran-medborgarskapsprovet-i-samhallskunskap-klara/',
  },
  {
    id: 'mv-medborgarskap-vuxna',
    url: 'https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html',
  },
  {
    id: 'mv-svenska-provet-kan-flyttas-fram',
    url: 'https://www.migrationsverket.se/nyhetsarkiv/medborgarskapsprovetisvenskakanflyttasfram.5.15b2309e1a04e5ed2071cc5.html',
  },
  {
    id: 'riksdagen-kommunallag-2017-725',
    url: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/kommunallag-2017725_sfs-2017-725/',
  },
  {
    id: 'riksdagen-skarpta-regler-unga',
    url: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/betankande/skarpta-regler-for-unga-lagovertradare_hd01juu41/',
  },
  {
    id: 'iaf-nya-regler-arbetsloshetsforsakring',
    url: 'https://www.iaf.se/pressrum/aktuellt-och-pressmeddelanden/nya-regler-for-arbetsloshetsforsakringen-fran-den-1-oktober/',
  },
]

const UA = 'medborgarskap-source-check (+https://github.com/duhman/medborgarskap)'

/** Readable text of the main content: no scripts, styles, navigation, header or footer. */
export function pageText(html) {
  let body = html
  const main = body.match(/<main[\s\S]*?<\/main>/i)
  if (main) body = main[0]
  return body
    .replace(/<(script|style|noscript|nav|header|footer|svg|form)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li|tr|div|section|article|dd|dt)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (m, name) => ({ ouml: 'ö', auml: 'ä', aring: 'å', Ouml: 'Ö', Auml: 'Ä', Aring: 'Å', eacute: 'é' })[name] ?? m)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

async function get(url, method = 'GET') {
  return fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20_000) })
}

/** Run tasks with at most `limit` in flight, so an outage costs one timeout per batch, not per URL. */
async function pool(items, limit, task) {
  const results = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await task(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [path] : []
  })
}

/** Official URLs referenced in the app code (uhr.se, migrationsverket.se and other .se authorities). */
function officialUrls() {
  const urls = new Set()
  for (const file of sourceFiles(join(root, 'src'))) {
    for (const m of readFileSync(file, 'utf8').matchAll(/https:\/\/[a-z0-9.-]*(uhr|migrationsverket|val|riksdagen|regeringen|skolverket|iaf)\.se[^\s'"`)<>]*/gi)) {
      urls.add(m[0].replace(/[.,]$/, ''))
    }
  }
  // Template-built MP3 links live in meta.ts; the literal prefix alone is not a page.
  return [...urls].filter((u) => !u.endsWith('/utbildningsmaterial'))
}

export async function runSourceCheck({ outDir = arg('out', join(root, 'source-snapshots')), reportFile = arg('report', null) } = {}) {
  mkdirSync(outDir, { recursive: true })

  const lines = ['## Källbevakning', '']
  let failures = 0

  const pageLines = await pool(WATCHED, 5, async (page) => {
    try {
      const res = await get(page.url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      writeFileSync(join(outDir, `${page.id}.txt`), pageText(await res.text()) + '\n')
      return `- ${page.id}: hämtad`
    } catch (err) {
      failures++
      return `- **${page.id}: kunde inte hämtas** (${err instanceof Error ? err.message : err}) ${page.url}`
    }
  })
  lines.push(...pageLines)

  lines.push('', '### Länkar i koden', '')
  const linkResults = await pool(officialUrls(), 6, async (url) => {
    try {
      let res = await get(url, 'HEAD')
      if (res.status === 405 || res.status === 403) res = await get(url)
      if (!res.ok) return `- ${url}: HTTP ${res.status}`
      if (res.redirected) return `- ${url}: omdirigeras till ${res.url} (uppdatera länken)`
      return null
    } catch (err) {
      return `- ${url}: ${err instanceof Error ? err.message : err}`
    }
  })
  const broken = linkResults.filter(Boolean)
  lines.push(...(broken.length ? broken : ['Alla länkar svarar utan omdirigering.']))

  const report = lines.join('\n') + '\n'
  if (reportFile) writeFileSync(reportFile, report)
  return { report, failures, broken: broken.length }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { report, failures, broken } = await runSourceCheck()
  console.log(report)
  console.log(`check-sources done (${WATCHED.length - failures}/${WATCHED.length} pages, ${broken} link problems).`)
  process.exitCode = failures > 0 ? 1 : broken > 0 ? 2 : 0
}
