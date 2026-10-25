#!/usr/bin/env node
/**
 * Local replacement for the browser half of CI (GitHub Actions is off, see
 * docs/agent-scope-infra-approved.md). Serves dist/ the way Vercel does (a prerendered
 * route/index.html first, then the SPA fallback), then runs axe on every route in light and dark,
 * the Grundform CTA contrast check and the end-to-end smoke test against it.
 *
 * `vite preview` is not used: it answers /kapitel/x with the home page HTML, which breaks hydration.
 * Run after `npm run build` (npm run check:all does both). CHROMIUM_PATH is passed through.
 */
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const PORT = Number(process.env.CHECK_PORT ?? 4174)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  for (const candidate of [clean, join(clean, 'index.html'), `${clean}.html`]) {
    const file = join(dist, candidate)
    if (file.startsWith(dist) && existsSync(file) && statSync(file).isFile()) return file
  }
  return join(dist, '404.html')
}

if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/ is missing: run npm run build first.')
  process.exit(1)
}

const server = createServer((req, res) => {
  const file = resolveFile(new URL(req.url ?? '/', 'http://x').pathname)
  res.writeHead(file === join(dist, '404.html') ? 404 : 200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise((resolve) => server.listen(PORT, resolve))

const env = { ...process.env, BASE_URL: `http://localhost:${PORT}` }
let failed = false
for (const script of ['scripts/check-search-visibility.mjs', 'scripts/a11y-axe.mjs', 'scripts/grundform-contrast.mjs', 'scripts/e2e-smoke.mjs']) {
  console.log(`\n> node ${script}`)
  // Async spawn: the static server above runs in this process and must keep answering.
  const code = await new Promise((resolve) => {
    spawn(process.execPath, [script], { stdio: 'inherit', env }).on('exit', resolve)
  })
  if (code !== 0) failed = true
}
server.close()
process.exit(failed ? 1 : 0)
