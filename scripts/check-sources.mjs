#!/usr/bin/env node
/**
 * Weekly source check. Fetches the official pages the site depends on, reduces each to its
 * readable text and writes one file per page to --out (default: source-snapshots/). The workflow
 * compares them with the previous run and opens an issue when something changed. Also checks
 * that every official URL in src/ still answers, and prints a Markdown report.
 *
 * Usage: node scripts/check-sources.mjs [--out <dir>] [--report <file>]
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
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
    id: 'mv-medborgarskap-vuxna',
    url: 'https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html',
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
  return fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30_000) })
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
    for (const m of readFileSync(file, 'utf8').matchAll(/https:\/\/[a-z0-9.-]*(uhr|migrationsverket|val|riksdagen|regeringen|skolverket)\.se[^\s'"`)<>]*/gi)) {
      urls.add(m[0].replace(/[.,]$/, ''))
    }
  }
  // Template-built MP3 links live in meta.ts; the literal prefix alone is not a page.
  return [...urls].filter((u) => !u.endsWith('/utbildningsmaterial'))
}

const outDir = arg('out', join(root, 'source-snapshots'))
const reportFile = arg('report', null)
mkdirSync(outDir, { recursive: true })

const lines = ['## Källbevakning', '']
let failures = 0

for (const page of WATCHED) {
  try {
    const res = await get(page.url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    writeFileSync(join(outDir, `${page.id}.txt`), pageText(await res.text()) + '\n')
    lines.push(`- ${page.id}: hämtad`)
  } catch (err) {
    failures++
    lines.push(`- **${page.id}: kunde inte hämtas** (${err instanceof Error ? err.message : err}) ${page.url}`)
  }
}

lines.push('', '### Länkar i koden', '')
const broken = []
for (const url of officialUrls()) {
  try {
    let res = await get(url, 'HEAD')
    if (res.status === 405 || res.status === 403) res = await get(url)
    if (!res.ok) broken.push(`- ${url}: HTTP ${res.status}`)
    else if (res.redirected) broken.push(`- ${url}: omdirigeras till ${res.url} (uppdatera länken)`)
  } catch (err) {
    broken.push(`- ${url}: ${err instanceof Error ? err.message : err}`)
  }
}
lines.push(...(broken.length ? broken : ['Alla länkar svarar utan omdirigering.']))

const report = lines.join('\n') + '\n'
if (reportFile) writeFileSync(reportFile, report)
console.log(report)
console.log(`check-sources done (${WATCHED.length - failures}/${WATCHED.length} pages, ${broken.length} link problems).`)
if (broken.some((b) => !b.includes('omdirigeras'))) process.exitCode = 2
