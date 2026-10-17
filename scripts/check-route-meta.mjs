#!/usr/bin/env node
/**
 * Ensures every static App route has document title/description handlers
 * and that the router owns head updates via applyRouteDocumentMeta.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ERROR = 'ROUTE_META_MISSING'

function fail(message) {
  console.error(`${ERROR}: ${message}`)
  process.exit(1)
}

function read(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

const app = read('src/App.tsx')
const titleSrc = read('src/lib/documentTitle.ts')
const descSrc = read('src/lib/documentDescription.ts')

if (!app.includes('applyRouteDocumentMeta')) {
  fail('src/App.tsx must call applyRouteDocumentMeta from the router (DocumentTitle hook).')
}

const staticRoutes = new Set(['/'])
if (!app.includes('<Route index')) {
  fail('Expected a home Route index in src/App.tsx.')
}

for (const match of app.matchAll(/<Route\s+path="([^:"*]+)"/g)) {
  staticRoutes.add(`/${match[1].replace(/^\/+/, '')}`)
}

const staticPageNames = [...titleSrc.matchAll(/^\s+'(\/[^']+)':/gm)].map((m) => m[1])
const staticPageDescriptions = [...descSrc.matchAll(/^\s+'(\/[^']+)':/gm)].map((m) => m[1])

for (const route of staticRoutes) {
  if (route === '/') continue
  if (!staticPageNames.includes(route)) {
    fail(`Static route ${route} has no entry in documentTitle staticPageNames.`)
  }
  if (!staticPageDescriptions.includes(route)) {
    fail(`Static route ${route} has no entry in documentDescription staticPageDescriptions.`)
  }
}

if (!titleSrc.includes('/kapitel\\/') || !titleSrc.includes('/ovning\\/')) {
  fail('documentTitle must handle dynamic /kapitel and /ovning routes.')
}

if (!descSrc.includes('/kapitel\\/') || !descSrc.includes('/ovning\\/')) {
  fail('documentDescription must handle dynamic /kapitel and /ovning routes.')
}

const chapterSlugs = [...read('src/content/chapters/meta.ts').matchAll(/slug:\s*'([^']+)'/g)].map(
  (m) => m[1],
)

for (const slug of chapterSlugs) {
  const chapterPath = `/kapitel/${slug}`
  if (!titleSrc.includes('chapterLabel') && !titleSrc.includes('chapterMetaList')) {
    fail('documentTitle must resolve chapter slugs via chapterMetaList.')
  }
  if (!descSrc.includes('chapterBySlug')) {
    fail('documentDescription must resolve chapter slugs via chapterBySlug.')
  }
  if (!read('public/sitemap.xml').includes(chapterPath)) {
    fail(`Sitemap missing chapter route ${chapterPath}.`)
  }
}

console.log(
  `check-route-meta ok (${staticRoutes.size} static routes, ${chapterSlugs.length} chapter slugs).`,
)
