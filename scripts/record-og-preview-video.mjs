#!/usr/bin/env node
/**
 * Isolated-stage og:video recorder (brief section 9). Composites body PNGs; band never fades.
 * Usage: npm run build && node scripts/record-og-preview-video.mjs
 */
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import sharp from 'sharp'
import {
  compositeFrame,
  captureBodyPng,
  captureFullPng,
  transitionAlphas,
  halveRetinaCapture,
} from './og-preview/compositor.mjs'
import { INIT_SCRIPT, progressSeed } from './og-preview/seed.mjs'
import { SEGMENTS, TOTAL_FRAMES, WIDTH, HEIGHT, FPS, segmentFrameCount } from './og-preview/timing.mjs'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const dist = join(root, 'dist')
const publicDir = join(root, 'public')
const proofDir = join(root, 'scripts/og-preview/proof')
const PORT = Number(process.env.OG_PREVIEW_PORT ?? 4175)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  for (const candidate of [clean, join(clean, 'index.html'), `${clean}.html`]) {
    const file = join(dist, candidate)
    if (file.startsWith(dist) && existsSync(file) && statSync(file).isFile()) return file
  }
  return join(dist, '404.html')
}

function startServer() {
  const server = createServer((req, res) => {
    const file = resolveFile(new URL(req.url ?? '/', 'http://x').pathname)
    res.writeHead(file === join(dist, '404.html') ? 404 : 200, {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    })
    res.end(readFileSync(file))
  })
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)))
}

async function assertFonts(page) {
  const ok = await page.evaluate(async () => {
    await document.fonts.ready
    const checks = [
      document.fonts.check('600 20px "IBM Plex Serif"'),
      document.fonts.check('500 20px Jost'),
      document.fonts.check('400 20px "IBM Plex Mono"'),
      document.fonts.check('400 20px "Grundform Numerals"'),
    ]
    return checks.every(Boolean)
  })
  if (!ok) {
    console.error('OG_PREVIEW_FONTS: required faces not loaded')
    process.exit(1)
  }
}

async function setProgress(page, count) {
  await page.evaluate((state) => {
    localStorage.setItem('medborgarskap-progress-v1', JSON.stringify(state))
  }, progressSeed(count))
}

async function main() {
  if (!existsSync(join(dist, 'index.html'))) {
    console.error('dist/ missing: run npm run build first')
    process.exit(1)
  }
  if (segmentFrameCount() !== TOTAL_FRAMES) {
    console.error(`OG_PREVIEW_TIMING: expected ${TOTAL_FRAMES} frames, got ${segmentFrameCount()}`)
    process.exit(1)
  }

  await mkdir(proofDir, { recursive: true })

  const server = await startServer()
  const base = `http://localhost:${PORT}`

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  })
  await context.addInitScript(INIT_SCRIPT)
  const page = await context.newPage()

  await page.goto(`${base}/og-preview/listen`, { waitUntil: 'networkidle' })
  await assertFonts(page)
  await page.getByRole('heading', { name: 'Politiska val och partier' }).waitFor({ timeout: 15_000 })
  await page.getByText('Stoppa uppläsningen').waitFor({ timeout: 15_000 })

  const listenFullRaw = await captureFullPng(page, `${base}/og-preview/listen`)
  const listenFull = await halveRetinaCapture(listenFullRaw)
  const bandPng = listenFull
  await writeFile(join(proofDir, 'reference-frame.png'), listenFull)

  await setProgress(page, 3)
  await page.goto(`${base}/og-preview/plan`, { waitUntil: 'networkidle' })
  const plan3 = await halveRetinaCapture(await captureBodyPng(page, `${base}/og-preview/plan`))

  await setProgress(page, 4)
  await page.goto(`${base}/og-preview/plan`, { waitUntil: 'networkidle' })
  const plan4 = await halveRetinaCapture(await captureBodyPng(page, `${base}/og-preview/plan`))

  const tagline = await halveRetinaCapture(await captureBodyPng(page, `${base}/og-preview/tagline`))

  await page.goto(`${base}/og-preview/quiz`, { waitUntil: 'networkidle' })
  await page.locator('.og-preview-quiz fieldset').waitFor()
  const quizFontBefore = await page.evaluate(() => {
    const q = document.querySelector('.og-preview-quiz-legend')
    return { questionPx: q ? parseFloat(getComputedStyle(q).fontSize) : 0 }
  })
  const quizQ = await halveRetinaCapture(await page.locator('.og-preview-quiz fieldset').screenshot({ type: 'png' }))
  await page.locator('[data-og-quiz="option-A"]').click()
  await page.locator('[data-og-quiz="submit"]').click()
  await page.waitForSelector('[data-og-quiz="reveal"]')
  await page.waitForTimeout(200)
  await page.locator('[data-og-citation="true"]').scrollIntoViewIfNeeded()
  const citationBox = await page.locator('[data-og-citation="true"]').evaluate((el) => {
    const inner = el.closest('.og-preview-body-inner')
    if (!inner) return null
    let x = 0
    let y = 0
    let node = el
    while (node && node !== inner) {
      x += node.offsetLeft
      y += node.offsetTop
      node = node.offsetParent
      if (node === document.body) break
    }
    return {
      x0: x,
      y0: y,
      x1: x + el.offsetWidth,
      y1: y + el.offsetHeight,
    }
  })
  const quizFontAfter = await page.evaluate(() => {
    const q = document.querySelector('.og-preview-quiz-legend')
    const r = document.querySelector('.og-preview-feedback-title')
    const c = document.querySelector('.og-preview-citation')
    return {
      questionPx: q ? parseFloat(getComputedStyle(q).fontSize) : 0,
      rattPx: r ? parseFloat(getComputedStyle(r).fontSize) : 0,
      citationPx: c ? parseFloat(getComputedStyle(c).fontSize) : 0,
    }
  })
  const quizR = await halveRetinaCapture(await page.locator('[data-og-quiz="reveal-card"]').screenshot({ type: 'png' }))

  await page.goto(`${base}/og-preview/listen`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Politiska val och partier' }).waitFor({ timeout: 15_000 })
  const listenBody = await halveRetinaCapture(await captureBodyPng(page, `${base}/og-preview/listen`))
  const listenTitlePx = await page.evaluate(() => {
    const h = document.querySelector('.og-preview-chapter-h1')
    return h ? parseFloat(getComputedStyle(h).fontSize) : 0
  })
  const emptyBody = await sharp({
    create: { width: WIDTH, height: HEIGHT - 131, channels: 4, background: { r: 250, g: 247, b: 241, alpha: 0 } },
  })
    .png()
    .toBuffer()

  const bodies = {
    listen: listenBody,
    'quiz-q': quizQ,
    'quiz-r': quizR,
    'plan-3': plan3,
    'plan-4': plan4,
    tagline,
    empty: emptyBody,
  }

  const bodiesDir = join(proofDir, 'bodies')
  await mkdir(bodiesDir, { recursive: true })
  for (const [name, buf] of Object.entries(bodies)) {
    await writeFile(join(bodiesDir, `${name}.png`), buf)
  }
  if (citationBox) {
    await writeFile(join(proofDir, 'citation-bbox.json'), JSON.stringify(citationBox, null, 2))
  }
  await writeFile(
    join(proofDir, 'font-metrics.json'),
    JSON.stringify({ quizQ: quizFontBefore, quizR: quizFontAfter, listenTitlePx }, null, 2),
  )

  const framesDir = join(proofDir, 'frames')
  await mkdir(framesDir, { recursive: true })

  const framePaths = []
  let frameIndex = 0

  for (const seg of SEGMENTS) {
    for (let f = 0; f < seg.frames; f++) {
      let png
      if (seg.kind === 'hold') {
        if (seg.beat === 'plan') {
          const body = f < 6 ? bodies['plan-3'] : bodies['plan-4']
          png = await compositeFrame({ bandPng, bodyPng: body, bodyAlpha: 1 })
        } else {
          png = await compositeFrame({ bandPng, bodyPng: bodies[seg.beat === 'listen' ? 'listen' : seg.beat], bodyAlpha: 1 })
        }
      } else if (seg.kind === 'reveal-tick') {
        const body = f < Math.floor(seg.frames / 2) ? bodies[seg.from] : bodies[seg.to]
        png = await compositeFrame({ bandPng, bodyPng: body, bodyAlpha: 1 })
      } else if (seg.kind === 'transition') {
        const { from: aFrom, to: aTo, empty } = transitionAlphas(f)
        if (empty) {
          png = await compositeFrame({ bandPng, bodyPng: bodies.empty, bodyAlpha: 0 })
        } else if (aTo > 0) {
          png = await compositeFrame({ bandPng, bodyPng: bodies[seg.to], bodyAlpha: aTo })
        } else {
          png = await compositeFrame({ bandPng, bodyPng: bodies[seg.from], bodyAlpha: aFrom })
        }
      }

      const path = join(framesDir, `frame-${String(frameIndex).padStart(4, '0')}.png`)
      await writeFile(path, png)
      framePaths.push(path)
      frameIndex++
    }
  }

  const loopAnchor = await readFile(framePaths[0])
  await writeFile(framePaths[framePaths.length - 1], loopAnchor)

  const mp4Path = join(publicDir, 'og-preview.mp4')
  await new Promise((resolve, reject) => {
    const ff = spawn(
      'ffmpeg',
      ['-y', '-framerate', String(FPS), '-i', join(framesDir, 'frame-%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4Path],
      { stdio: 'inherit' },
    )
    ff.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))))
  })

  const posterFrame = framePaths[42 + 18 + 18 + 3 + 30]
  const posterJpg = join(publicDir, 'og-preview-poster.jpg')
  await sharp(posterFrame).jpeg({ quality: 90 }).toFile(posterJpg)
  await sharp(posterFrame).png().toFile(join(publicDir, 'og-image.png'))

  await browser.close()
  server.close()

  console.log(`Wrote ${mp4Path}, ${posterJpg}, og-image.png (${framePaths.length} frames)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
