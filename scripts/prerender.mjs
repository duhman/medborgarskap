#!/usr/bin/env node
/**
 * Build-time prerender. Renders every sitemap route to static HTML so crawlers that do not run
 * JavaScript (OAI-SearchBot, PerplexityBot, Bingbot on first pass) see the real page text,
 * the route's own title, description and canonical, and per-route JSON-LD. Also writes llms.txt.
 *
 * Runs after `vite build`. The browser entry hydrates this markup (src/main.tsx), so what a route
 * renders here must match its first client render: read browser-only state (localStorage) through
 * useSyncExternalStore with an empty server snapshot, never during render.
 * Fails with PRERENDER_FAILED when a route renders the not-found state or the template drifts.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrOut = join(root, 'node_modules', '.prerender')
const ERROR = 'PRERENDER_FAILED'

function fail(message) {
  console.error(`${ERROR}: ${message}`)
  process.exit(1)
}

const escAttr = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escText = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*("\\s*/?>)`, 'm')
  if (!re.test(html)) fail(`template is missing <meta ${attr}="${key}">`)
  return html.replace(re, `$1${escAttr(value)}$2`)
}

export function readSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1]
    const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]
    return { loc, path: new URL(loc).pathname, lastmod }
  })
}

async function main() {
  await build({
    root,
    logLevel: 'warn',
    build: { ssr: 'src/entry-server.tsx', outDir: ssrOut, emptyOutDir: true, copyPublicDir: false },
  })
  const { preload, render } = await import(pathToFileURL(join(ssrOut, 'entry-server.js')).href)
  await preload()
  const template = readFileSync(join(dist, 'index.html'), 'utf8')
  if (!template.includes('<div id="root"></div>')) fail('dist/index.html has no empty #root')

  const routes = readSitemap(readFileSync(join(root, 'public', 'sitemap.xml'), 'utf8'))
  if (routes.length === 0) fail('sitemap has no routes')
  const pages = []

  for (const route of routes) {
    const page = render(route.path, route.lastmod)
    if (/hittades inte/.test(page.html)) fail(`${route.path} rendered the not-found state`)
    if (page.html.includes('<!--$!-->')) fail(`${route.path} rendered a Suspense fallback instead of the page`)
    if (page.canonical !== route.loc) fail(`${route.path} canonical ${page.canonical} differs from sitemap ${route.loc}`)
    let html = template
      .replace('<div id="root"></div>', `<div id="root">${page.html}</div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${escText(page.title)}</title>`)
      .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${escAttr(page.canonical)}$2`)
      .replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        page.jsonLd
          .map((block) => `<script type="application/ld+json" data-route="${escAttr(route.path)}">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`)
          .join('\n    '),
      )
    for (const [attr, key, value] of [
      ['name', 'description', page.description],
      ['property', 'og:title', page.title],
      ['property', 'og:description', page.description],
      ['property', 'og:url', page.canonical],
      ['name', 'twitter:title', page.title],
      ['name', 'twitter:description', page.description],
      ['name', 'twitter:url', page.canonical],
    ]) {
      html = setMeta(html, attr, key, value)
    }
    const file = route.path === '/' ? join(dist, 'index.html') : join(dist, route.path, 'index.html')
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, html)
    pages.push({ ...route, title: page.title, description: page.description })
  }

  writeFileSync(join(dist, 'llms.txt'), llmsTxt(pages))
  rmSync(ssrOut, { recursive: true, force: true })
  console.log(`prerender ok (${pages.length} routes, llms.txt written).`)
}

function llmsTxt(pages) {
  const section = (title, filter) => {
    const list = pages.filter(filter)
    return list.length
      ? `## ${title}\n\n${list.map((p) => `- [${p.title.replace(/ \| Medborgarskap$/, "")}](${p.loc}): ${p.description}`).join('\n')}\n`
      : ''
  }
  return [
    '# Medborgarskap',
    '',
    '> Gratis, fristående studiehjälp till det svenska medborgarskapsprovet. Kapitel och övningsfrågor baserade på UHR:s studiematerial Sverige i fokus. Inte en myndighetstjänst och inte knuten till UHR eller Migrationsverket.',
    '',
    'Källa för allt innehåll: Sverige i fokus (UHR), https://www.uhr.se/medborgarskapsprovet/utbildningsmaterial/. Provdatum och regler publiceras av UHR och Migrationsverket; sidan hittar aldrig på datum.',
    '',
    section('Sidor', (p) => !/^\/(kapitel|ovning)\//.test(p.path)),
    section('Kapitel', (p) => p.path.startsWith('/kapitel/')),
    section('Övningar', (p) => p.path.startsWith('/ovning/')),
    'Skapad av Adrian Martén, https://adrianmarten.net',
    '',
  ].join('\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
