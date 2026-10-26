import sharp from 'sharp'
import { BODY_TOP, BAND_BOTTOM, HEIGHT, WIDTH } from './timing.mjs'

/**
 * Composite one frame: fixed band from reference + body layer with optional alpha.
 * Never crossfade two bodies: opacity steps only (brief section 3).
 */
export async function compositeFrame({ bandPng, bodyPng, bodyAlpha = 1, paperHex = '#FAF7F1' }) {
  const paper = await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: paperHex },
  })
    .png()
    .toBuffer()

  const band = await sharp(bandPng).extract({ left: 0, top: 0, width: WIDTH, height: BAND_BOTTOM }).toBuffer()

  const bodyHeight = HEIGHT - BODY_TOP
  let bodyLayer = sharp(bodyPng).resize({ width: WIDTH, height: bodyHeight, fit: 'inside' }).ensureAlpha()
  if (bodyAlpha < 1) bodyLayer = bodyLayer.linear(bodyAlpha, 0)
  const bodyLayerBuf = await bodyLayer.png().toBuffer()

  const bodyFull = await sharp({
    create: { width: WIDTH, height: bodyHeight, channels: 4, background: { r: 250, g: 247, b: 241, alpha: 0 } },
  })
    .composite([{ input: bodyLayerBuf, top: 0, left: 0 }])
    .png()
    .toBuffer()

  return sharp(paper)
    .composite([
      { input: band, top: 0, left: 0 },
      { input: bodyFull, top: BODY_TOP, left: 0 },
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
  const body = page.locator('[data-og-body="true"]')
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
