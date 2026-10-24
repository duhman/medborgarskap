#!/usr/bin/env node
/**
 * Regenerates public/sitemap.xml with <lastmod> from the git date of the files behind each route.
 * Run locally after content changes (`npm run sitemap`) and commit the result: Vercel builds have
 * no git history, so dates cannot be computed at deploy time.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://medborgarskap.adrianmarten.net'
const slugs = [...readFileSync(join(root, 'src/content/chapters/meta.ts'), 'utf8').matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])

const pages = [
  ['/', ['src/pages/Home.tsx', 'src/config/status.ts']],
  ['/behover-jag', ['src/pages/BehoverJag.tsx', 'src/config/pathwaySources.ts']],
  ['/kapitel', ['src/pages/KapitelIndex.tsx', 'src/content/chapters/meta.ts']],
  ['/provfragor', ['src/pages/Provfragor.tsx', 'src/content/officialSamples.ts']],
  ['/ovning/blandat', ['src/pages/OvningBlandat.tsx', 'src/content/chapters']],
  ['/ovning/mina-fel', ['src/pages/OvningMinaFel.tsx']],
  ['/vanliga-fragor', ['src/pages/VanligaFragor.tsx', 'src/content/faq.ts']],
  ['/om', ['src/pages/Om.tsx']],
  ['/integritet', ['src/pages/Integritet.tsx']],
  ['/villkor', ['src/pages/Villkor.tsx']],
  ...slugs.map((s) => [`/kapitel/${s}`, ['src/pages/KapitelStudy.tsx', `src/content/chapters/${s}.ts`]]),
  ...slugs.map((s) => [`/ovning/${s}`, ['src/pages/OvningQuiz.tsx', `src/content/chapters/${s}.ts`]]),
]

function gitDate(files) {
  const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { cwd: root, encoding: 'utf8' }).trim()
  return out || new Date().toISOString().slice(0, 10)
}

const body = pages
  .map(([path, files]) => `  <url>\n    <loc>${ORIGIN}${path}</loc>\n    <lastmod>${gitDate(files)}</lastmod>\n  </url>`)
  .join('\n')
writeFileSync(
  join(root, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
)
console.log(`sitemap ok (${pages.length} urls).`)
