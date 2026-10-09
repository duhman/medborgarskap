import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/kapitel', name: 'kapitel' },
  { path: '/behover-jag', name: 'behover-jag' },
]
const PORT = Number(process.env.A11Y_PORT ?? 4173)
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`
const OUT_DIR = process.env.SCREENSHOT_OUT_DIR ?? 'a11y-screenshots'
const SHA = process.env.GIT_SHA ?? 'local'

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

async function run() {
  mkdirSync(OUT_DIR, { recursive: true })
  const { close } = startPreview()
  try {
    await waitForServer(`${BASE_URL}/`)
    const browser = await chromium.launch()

    for (const route of ROUTES) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
      const page = await context.newPage()
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' })
      await page.screenshot({
        path: `${OUT_DIR}/${route.name}-${SHA.slice(0, 7)}.png`,
        fullPage: true,
      })
      await context.close()
    }

    await browser.close()
  } finally {
    await close()
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
