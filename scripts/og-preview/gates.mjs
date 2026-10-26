import { BODY_TOP, BAND_BOTTOM } from './timing.mjs'
import { frameMeanWithinPaperBand, rgbMeanFromBuffer, deltaE } from './palette.mjs'

const SAFE_INSET = 60
const BODY_MIN_CHANNEL_TRANS = 200

/** Whole-frame mean must stay in paper L band (Grundform paper-band gate). */
export function paperBandGate(meanRgb) {
  return frameMeanWithinPaperBand(meanRgb)
}

/**
 * Body region during transitions: 60px side gutters stay >= 200 on every channel (no fade-through-black).
 * Center column may dim while text fades; gutters must stay paper-bright.
 */
export function bodyTransitionMinChannelGate(data, width, height, beat) {
  if (beat !== 'trans') return true
  const bodyHeight = height - BODY_TOP
  const rowBytes = width * 4
  for (let y = 0; y < bodyHeight; y++) {
    for (let x = 0; x < width; x++) {
      if (x >= SAFE_INSET && x < width - SAFE_INSET) continue
      const i = (BODY_TOP + y) * rowBytes + x * 4
      const m = Math.min(data[i], data[i + 1], data[i + 2])
      if (m < BODY_MIN_CHANNEL_TRANS) return false
    }
  }
  return true
}

/** Pixels within deltaE 4 of paper on the empty transition reference (body region). */
export function buildPaperMask(fullData, width, bodyTop, bodyHeight) {
  const mask = new Uint8Array(width * bodyHeight)
  for (let y = 0; y < bodyHeight; y++) {
    for (let x = 0; x < width; x++) {
      const i = ((bodyTop + y) * width + x) * 4
      const d = deltaE(
        `#${[fullData[i], fullData[i + 1], fullData[i + 2]].map((c) => c.toString(16).padStart(2, '0')).join('')}`,
        '#FAF7F1',
      )
      if (d <= 4) mask[y * width + x] = 1
    }
  }
  return mask
}

function isPaperish(r, g, b) {
  return deltaE(`#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`, '#FAF7F1') <= 8
}

/** No non-paper pixels in 60px side margins below the header band. */
export function safeMarginGate(data, width, height) {
  for (let y = BAND_BOTTOM; y < height; y++) {
    for (let x = 0; x < SAFE_INSET; x++) {
      const i = (y * width + x) * 4
      if (!isPaperish(data[i], data[i + 1], data[i + 2])) return false
    }
    for (let x = width - SAFE_INSET; x < width; x++) {
      const i = (y * width + x) * 4
      if (!isPaperish(data[i], data[i + 1], data[i + 2])) return false
    }
  }
  return true
}

/** Minimum OCR word box height (px at 1200 wide) on hold beats. */
export function minTextHeightGate(words, beat) {
  if (beat === 'trans') return []
  /** OCR line boxes under-measure vs CSS; 15px bbox ~ 29px+ type at 1200 canvas. */
  const minPx = 15
  const tall = words.filter((w) => w.h >= minPx)
  if (!tall.length) return [`no OCR line box >= ${minPx}px on beat ${beat}`]

  const requiredPatterns = {
    listen: [/Stoppa|Lyssna|Politiska|partier/i],
    'quiz-q': [/Hur ofta/i],
    'quiz-r': [/Hur ofta|Rätt|14|Kapitel/i],
    'plan-3': [/kapitel|13|övade/i],
    'plan-4': [/kapitel|13|övade/i],
    tagline: [/Plugga|medborgarskap|källa|rätt/i],
  }
  const patterns = requiredPatterns[beat]
  if (!patterns) return []

  const problems = []
  for (const pat of patterns) {
    const hit = tall.find((w) => pat.test(w.text))
    if (!hit) problems.push(`no tall OCR box matching ${pat}`)
  }
  return problems
}

export { rgbMeanFromBuffer, SAFE_INSET, BODY_MIN_CHANNEL_TRANS }
