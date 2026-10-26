import sharp from 'sharp'
import { BODY_TOP, BAND_BOTTOM, HEIGHT, WIDTH } from './timing.mjs'

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

const BODY_COLUMN_MAX = 860
const SAFE_INSET = 60

async function flattenBodyRgb(bodyPng, bodyWidth, bodyHeight, paperHex, layout = 'default') {
  const paperBody = await sharp({
    create: { width: bodyWidth, height: bodyHeight, channels: 3, background: paperHex },
  })
    .png()
    .toBuffer()

  const quizMaxW = bodyWidth - SAFE_INSET * 2
  /** Keep Beat B ink above frame y=570 (60px bottom safe margin on 630px canvas). */
  const quizMaxH = bodyHeight - SAFE_INSET
  const resize =
    layout === 'quiz'
      ? { width: quizMaxW, height: quizMaxH, fit: 'inside' }
      : {
          width: BODY_COLUMN_MAX,
          height: bodyHeight,
          fit: 'inside',
          withoutEnlargement: true,
        }

  const bodySized = await sharp(bodyPng)
    .resize(resize)
    .ensureAlpha()
    .png()
    .toBuffer()
  const sizedMeta = await sharp(bodySized).metadata()
  const left = Math.max(0, Math.round((bodyWidth - (sizedMeta.width || 0)) / 2))
  const top =
    layout === 'quiz' ? 0 : Math.max(0, Math.round((bodyHeight - (sizedMeta.height || 0)) / 2))

  return sharp(paperBody)
    .composite([{ input: bodySized, top, left, blend: 'over' }])
    .removeAlpha()
    .raw()
    .toBuffer()
}

function blendRgbTowardPaper(flatRgb, bodyWidth, bodyHeight, alpha, paperRgb) {
  const out = Buffer.alloc(bodyWidth * bodyHeight * 3)
  const a = Math.max(0, Math.min(1, alpha))
  for (let i = 0, px = 0; px < bodyWidth * bodyHeight; px++, i += 3) {
    out[i] = Math.round(flatRgb[i] * a + paperRgb.r * (1 - a))
    out[i + 1] = Math.round(flatRgb[i + 1] * a + paperRgb.g * (1 - a))
    out[i + 2] = Math.round(flatRgb[i + 2] * a + paperRgb.b * (1 - a))
  }
  return out
}

/**
 * Composite one frame: fixed band from reference + body layer with optional alpha over paper.
 * Body fade linearly blends flattened RGB toward paper (never through black).
 */
export async function compositeFrame({
  bandPng,
  bodyPng,
  bodyAlpha = 1,
  paperHex = '#FAF7F1',
  bodyLayout = 'default',
}) {
  const paperRgb = hexToRgb(paperHex)
  const paper = await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: paperHex },
  })
    .png()
    .toBuffer()

  const band = await sharp(bandPng).extract({ left: 0, top: 0, width: WIDTH, height: BAND_BOTTOM }).toBuffer()

  const bodyHeight = HEIGHT - BODY_TOP
  const flatRgb = await flattenBodyRgb(bodyPng, WIDTH, bodyHeight, paperHex, bodyLayout)
  const bodyRgb =
    bodyAlpha >= 0.999 ? flatRgb : blendRgbTowardPaper(flatRgb, WIDTH, bodyHeight, bodyAlpha, paperRgb)

  const bodyLayer = await sharp(bodyRgb, { raw: { width: WIDTH, height: bodyHeight, channels: 3 } }).png().toBuffer()

  return sharp(paper)
    .composite([
      { input: band, top: 0, left: 0 },
      { input: bodyLayer, top: BODY_TOP, left: 0 },
    ])
    .png()
    .toBuffer()
}

/** 0.6s transition: 9 frames out, 1 empty, 8 frames in (18 total). */
export function transitionAlphas(frameInSegment) {
  if (frameInSegment < 9) return { from: 1 - (frameInSegment + 1) / 9, to: 0, empty: false }
  if (frameInSegment === 9) return { from: 0, to: 0, empty: true }
  const t = frameInSegment - 10
  return { from: 0, to: (t + 1) / 8, empty: false }
}

export async function captureBodyPng(page, stagePath) {
  await page.goto(stagePath, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-og-body="true"]')
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  const body = page.locator('[data-og-body="true"] .og-preview-body-inner')
  return body.screenshot({ type: 'png' })
}

export async function captureFullPng(page, stagePath) {
  await page.goto(stagePath, { waitUntil: 'networkidle' })
  await page.waitForSelector('.og-preview-root')
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  return page.locator('.og-preview-root').screenshot({ type: 'png' })
}

/** Halve a 2x retina capture to 1200px-canvas pixel size (no fit-to-frame shrink). */
export async function halveRetinaCapture(png) {
  const meta = await sharp(png).metadata()
  const w = meta.width ?? WIDTH
  const h = meta.height ?? HEIGHT
  return sharp(png)
    .resize({ width: Math.round(w / 2), height: Math.round(h / 2) })
    .png()
    .toBuffer()
}
