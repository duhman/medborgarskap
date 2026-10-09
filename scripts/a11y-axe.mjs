import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { getA11yRoutes } from './a11y-routes.mjs'

const require = createRequire(import.meta.url)
const { devDependencies } = require('../package.json')
/** Keep in sync with devDependencies.playwright (exact pin). */
const PINNED_PLAYWRIGHT_VERSION =
  devDependencies.playwright?.replace(/^\^/, '') ?? '1.52.0'

const ROUTES = getA11yRoutes()
const PORT = Number(process.env.A11Y_PORT ?? 4173)
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`
const OUT_DIR = process.env.A11Y_OUT_DIR ?? 'a11y-results'
const LABEL = process.env.A11Y_LABEL ?? 'run'

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`Server not ready at ${url}`)
}

function startPreview() {
  if (process.env.BASE_URL) {
    return { close: async () => {} }
  }
  const proc = spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], {
    stdio: 'inherit',
    shell: true,
  })
  const close = async () => {
    if (proc.exitCode === null) {
      proc.kill('SIGTERM')
      await once(proc, 'exit').catch(() => {})
    }
  }
  return { close }
}

function routeFileSlug(route) {
  if (route === '/') return 'home'
  return route.replace(/^\//, '').replace(/\//g, '-')
}

async function run() {
  mkdirSync(OUT_DIR, { recursive: true })
  const { close } = startPreview()
  try {
    await waitForServer(`${BASE_URL}/`)

    const browser = await chromium.launch()
    const summary = {
      label: LABEL,
      playwrightVersion: PINNED_PLAYWRIGHT_VERSION,
      routeCount: ROUTES.length,
      routes: {},
      violationCount: 0,
    }

    for (const route of ROUTES) {
      const context = await browser.newContext()
      const page = await context.newPage()
      const url = `${BASE_URL}${route}`
      await page.goto(url, { waitUntil: 'load' })
      await page.waitForSelector('#main-content', { state: 'visible' })
      const results = await new AxeBuilder({ page }).analyze()
      const colorContrast = results.violations.filter((v) => v.id === 'color-contrast')
      summary.routes[route] = {
        violations: results.violations.length,
        colorContrast: colorContrast.length,
        colorContrastNodes: colorContrast.reduce((n, v) => n + (v.nodes?.length ?? 0), 0),
        violationIds: results.violations.map((v) => v.id),
      }
      summary.violationCount += results.violations.length
      writeFileSync(
        `${OUT_DIR}/${LABEL}-${routeFileSlug(route)}.json`,
        JSON.stringify(results, null, 2),
      )
      await context.close()
    }

    await browser.close()
    writeFileSync(`${OUT_DIR}/${LABEL}-summary.json`, JSON.stringify(summary, null, 2))
    console.log(JSON.stringify(summary, null, 2))

    if (summary.violationCount > 0) {
      process.exitCode = 1
    }
  } finally {
    await close()
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
