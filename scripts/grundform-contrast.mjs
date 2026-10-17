import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const PORT = Number(process.env.A11Y_PORT ?? 4173)
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`
const MIN_CONTRAST = Number(process.env.GRUNDFORM_MIN_CONTRAST ?? 4.5)
const CTA_SELECTOR = 'main a.bg-accent'

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

function parseRgb(cssColor) {
  const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) {
    throw new Error(`GRUNDFORM_CTA_CONTRAST: could not parse color "${cssColor}"`)
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function relativeLuminance([r, g, b]) {
  const channel = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const [rs, gs, bs] = [r, g, b].map(channel)
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

async function run() {
  const { close } = startPreview()
  try {
    await waitForServer(`${BASE_URL}/`)
    const browser = await chromium.launch()
    const page = await browser.newPage()
    await page.goto(`${BASE_URL}/`, { waitUntil: 'load' })
    await page.waitForSelector(CTA_SELECTOR, { state: 'visible' })

    const sample = await page.$eval(CTA_SELECTOR, (el) => {
      const style = getComputedStyle(el)
      return {
        text: el.textContent?.trim() ?? '',
        color: style.color,
        backgroundColor: style.backgroundColor,
      }
    })

    const fg = parseRgb(sample.color)
    const bg = parseRgb(sample.backgroundColor)
    const ratio = contrastRatio(fg, bg)

    await browser.close()

    if (ratio < MIN_CONTRAST) {
      console.error(
        `GRUNDFORM_CTA_CONTRAST: "${sample.text}" contrast ${ratio.toFixed(2)}:1 ` +
          `(fg ${sample.color}, bg ${sample.backgroundColor}); need >= ${MIN_CONTRAST}:1`,
      )
      process.exit(1)
    }

    console.log(
      `grundform-contrast ok: "${sample.text}" ${ratio.toFixed(2)}:1 (${sample.color} on ${sample.backgroundColor})`,
    )
  } finally {
    await close()
  }
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
