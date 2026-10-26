import { BODY_TOP, BAND_TOP } from './timing.mjs'
import { frameMeanWithinPaperBand, rgbMeanFromBuffer, deltaE } from './palette.mjs'

const SAFE_INSET = 60
const BODY_MIN_CHANNEL_TRANS = 200
const MIN_LINE_HEIGHT_PX = 29
const MIN_LINE_HEIGHT_OCR_PX = 28
const ACCENT = { r: 0x2d, g: 0x4a, b: 0x3e }

/** Whole-frame mean must stay in paper L band (Grundform paper-band gate). */
export function paperBandGate(meanRgb) {
  return frameMeanWithinPaperBand(meanRgb)
}

/**
 * Body region during transitions: 60px side gutters stay >= 200 on every channel (no fade-through-black).
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

function isPaperish(r, g, b) {
  return deltaE(`#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`, '#FAF7F1') <= 8
}

/** No non-paper pixels in 60px side margins (header band + body). */
export function safeMarginGate(data, width, height) {
  const yStart = BAND_TOP
  for (let y = yStart; y < height; y++) {
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

function lineHeightMin(lines, patterns) {
  const heights = []
  for (const pat of patterns) {
    const matched = lines.filter((ln) => pat.test(ln.text.trim()))
    const pool = matched.filter((ln) => ln.h >= 18)
    const use = pool.length ? pool : matched
    if (!use.length) return { ok: false, reason: `no line matching ${pat}` }
    heights.push(Math.min(...use.map((ln) => ln.h)))
  }
  const minH = Math.min(...heights)
  if (minH < MIN_LINE_HEIGHT_OCR_PX) {
    return { ok: false, reason: `minimum matching line height ${minH}px < ${MIN_LINE_HEIGHT_OCR_PX}px` }
  }
  return { ok: true }
}

/** Minimum OCR line box height (not median) for key strings per beat. */
export function minTextHeightGate(lines, beat) {
  if (beat === 'trans') return []

  const rules = {
    listen: [/Politiska|partier|val och/i], // OCR backup; listen uses font-metrics when present
    'quiz-q': [/Hur ofta/i],
    'quiz-r': [/Hur ofta hålls/i, /Rätt svar|RÄTT svar/i],
    'plan-3': [/kapitel|övade|13/i],
    'plan-4': [/kapitel|övade|13/i],
    tagline: [/Plugga|medborgarskap/i, /källa|rätt/i],
  }
  const patterns = rules[beat]
  if (!patterns) return []

  const result = lineHeightMin(lines, patterns)
  if (!result.ok) return [result.reason]

  if (beat === 'quiz-r') {
    const ratt = lines.filter((ln) => /^Rätt/i.test(ln.text.trim()))
    const labelH = ratt.length ? Math.max(...ratt.map((ln) => ln.h)) : 0
    if (labelH < MIN_LINE_HEIGHT_PX) {
      return [`Rätt label max line height ${labelH}px < ${MIN_LINE_HEIGHT_PX}px`]
    }
  }

  return []
}

function overlapArea(a, b) {
  const x0 = Math.max(a.x0, b.x0)
  const y0 = Math.max(a.y0, b.y0)
  const x1 = Math.min(a.x1, b.x1)
  const y1 = Math.min(a.y1, b.y1)
  if (x1 <= x0 || y1 <= y0) return 0
  return (x1 - x0) * (y1 - y0)
}

/** Fail when OCR line boxes overlap (Beat B layout collision). */
export function overlappingOcrLinesGate(lines) {
  const problems = []
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const a = lines[i]
      const b = lines[j]
      if (!a.text.trim() || !b.text.trim()) continue
      const area = overlapArea(a, b)
      const minArea = Math.min(a.w * a.h, b.w * b.h)
      if (area > 40 && area > minArea * 0.15) {
        problems.push(`lines overlap: "${a.text.trim().slice(0, 30)}" vs "${b.text.trim().slice(0, 30)}"`)
        return problems
      }
    }
  }
  return problems
}

function isRedHuePixel(r, g, b) {
  if (r < 140) return false
  if (g > 100) return false
  if (b > 100) return false
  if (r <= g + 25) return false
  if (r <= b + 25) return false
  return true
}

/** Citation strip must not contain orange/red link hues (accent #2D4A3E only). Coords are body-local. */
export function citationRedHueGateBody(data, width, bodyHeight, bbox) {
  if (!bbox) return ['citation bbox missing']
  let redish = 0
  let sampled = 0
  const x0 = Math.max(0, bbox.x0)
  const y0 = Math.max(0, bbox.y0)
  const x1 = Math.min(width, bbox.x1)
  const y1 = Math.min(bodyHeight, bbox.y1)
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4
      if (i + 2 >= data.length) continue
      sampled++
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const nearAccent =
        Math.abs(r - ACCENT.r) <= 35 && Math.abs(g - ACCENT.g) <= 35 && Math.abs(b - ACCENT.b) <= 35
      if (nearAccent || isPaperish(r, g, b)) continue
      if (isRedHuePixel(r, g, b)) redish++
    }
  }
  if (sampled > 0 && redish / sampled > 0.002) {
    return [`citation region red-hue ratio ${(redish / sampled).toFixed(4)}`]
  }
  return []
}

const WORDMARK_LEAK_Y = 120

/** Fail when header wordmark OCR appears in the body band (leaked capture or double header). */
export function bodyWordmarkLeakGate(lines, yMin = WORDMARK_LEAK_Y) {
  const problems = []
  for (const ln of lines) {
    if (ln.y0 <= yMin) continue
    const t = ln.text.trim()
    if (!t) continue
    if (/Medborgarskap|provamed/i.test(t)) {
      problems.push(`wordmark below y=${yMin}: "${t.slice(0, 48)}" (y0=${Math.round(ln.y0)})`)
    }
  }
  return problems
}

/** CSS font-size gate from Playwright computed styles (canonical 1200px canvas). */
export function cssFontSizeGate(metrics, beat) {
  if (!metrics) return []
  const problems = []
  if (beat === 'quiz-q' && metrics.quizQ?.questionPx < MIN_LINE_HEIGHT_PX) {
    problems.push(`quiz-q question ${metrics.quizQ.questionPx}px < ${MIN_LINE_HEIGHT_PX}px`)
  }
  if (beat === 'quiz-q' && metrics.quizQ?.choicePx != null && metrics.quizQ.choicePx < MIN_LINE_HEIGHT_PX) {
    problems.push(`quiz-q choice ${metrics.quizQ.choicePx}px < ${MIN_LINE_HEIGHT_PX}px`)
  }
  if (beat === 'quiz-r' && metrics.quizR) {
    if (metrics.quizR.questionPx < MIN_LINE_HEIGHT_PX) {
      problems.push(`quiz-r question ${metrics.quizR.questionPx}px < ${MIN_LINE_HEIGHT_PX}px`)
    }
    if (metrics.quizR.rattPx < MIN_LINE_HEIGHT_PX) {
      problems.push(`quiz-r Rätt ${metrics.quizR.rattPx}px < ${MIN_LINE_HEIGHT_PX}px`)
    }
    if (metrics.quizR.choicePx != null && metrics.quizR.choicePx < MIN_LINE_HEIGHT_PX) {
      problems.push(`quiz-r choice ${metrics.quizR.choicePx}px < ${MIN_LINE_HEIGHT_PX}px`)
    }
  }
  if (beat === 'listen' && metrics.listenTitlePx != null && metrics.listenTitlePx < MIN_LINE_HEIGHT_PX) {
    problems.push(`listen title ${metrics.listenTitlePx}px < ${MIN_LINE_HEIGHT_PX}px`)
  }
  return problems
}

export { rgbMeanFromBuffer, SAFE_INSET, BODY_MIN_CHANNEL_TRANS, MIN_LINE_HEIGHT_PX }
