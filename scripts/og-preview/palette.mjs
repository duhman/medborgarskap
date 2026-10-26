/** Grundform light palette for og:video checks (brief section 6). */
export const ALLOWED = [
  { name: 'paper', hex: '#FAF7F1' },
  { name: 'sunk', hex: '#F1ECE2' },
  { name: 'raised', hex: '#FFFDF8' },
  { name: 'line', hex: '#E3DCD0' },
  { name: 'line-strong', hex: '#C9C0B1' },
  { name: 'ink', hex: '#211D18' },
  { name: 'ink-2', hex: '#4D463D' },
  { name: 'ink-3', hex: '#6E665A' },
  { name: 'accent', hex: '#2D4A3E' },
  { name: 'accent-deep', hex: '#1F352C' },
  { name: 'accent-soft', hex: '#E8F0EC' },
  { name: 'ok', hex: '#2A7349' },
  { name: 'error', hex: '#B8322A' },
  { name: 'ok-tint', hex: blendHex('#2A7349', '#FFFDF8', 0.1) },
  { name: 'error-tint', hex: blendHex('#B8322A', '#FFFDF8', 0.08) },
]

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function blendHex(fg, bg, alpha) {
  const a = hexToRgb(fg)
  const b = hexToRgb(bg)
  const mix = (x, y) => Math.round(x * alpha + y * (1 - alpha))
  const r = mix(a.r, b.r)
  const g = mix(a.g, b.g)
  const bl = mix(a.b, b.b)
  return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

function rgbToLab({ r, g, b }) {
  let R = r / 255
  let G = g / 255
  let B = b / 255
  R = R > 0.04045 ? ((R + 0.055) / 1.055) ** 2.4 : R / 12.92
  G = G > 0.04045 ? ((G + 0.055) / 1.055) ** 2.4 : G / 12.92
  B = B > 0.04045 ? ((B + 0.055) / 1.055) ** 2.4 : B / 12.92
  let X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047
  let Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
  let Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883
  X = X > 0.008856 ? X ** (1 / 3) : 7.787 * X + 16 / 116
  Y = Y > 0.008856 ? Y ** (1 / 3) : 7.787 * Y + 16 / 116
  Z = Z > 0.008856 ? Z ** (1 / 3) : 7.787 * Z + 16 / 116
  return { L: 116 * Y - 16, a: 500 * (X - Y), b: 200 * (Y - Z) }
}

export function deltaE(hexA, hexB) {
  const A = rgbToLab(hexToRgb(hexA))
  const B = rgbToLab(hexToRgb(hexB))
  return Math.hypot(A.L - B.L, A.a - B.a, A.b - B.b)
}

const ALLOWED_LAB = ALLOWED.map((c) => ({ ...c, lab: rgbToLab(hexToRgb(c.hex)) }))
const PAPER = rgbToLab(hexToRgb('#FAF7F1'))

export function nearestAllowedDeltaE(r, g, b) {
  let best = Infinity
  for (const c of ALLOWED_LAB) {
    const d = Math.hypot(c.lab.L - rgbToLab({ r, g, b }).L, c.lab.a - rgbToLab({ r, g, b }).a, c.lab.b - rgbToLab({ r, g, b }).b)
    if (d < best) best = d
  }
  return best
}

/** Mean frame colour must stay within ΔE 6 of paper (brief section 6). */
export function frameMeanWithinPaperBand(meanRgb) {
  const lab = rgbToLab(meanRgb)
  const d = Math.hypot(lab.L - PAPER.L, lab.a - PAPER.a, lab.b - PAPER.b)
  return d <= 6
}

export function rgbMeanFromBuffer(data, width, height) {
  let r = 0
  let g = 0
  let b = 0
  const n = width * height
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  return { r: r / n, g: g / n, b: b / n }
}

/** Fail if more than 2% of pixels are ΔE 12+ from every allowed colour. */
export function offPaletteRatio(rgba, width, height, tolerance = 12) {
  let bad = 0
  let sampled = 0
  for (let i = 0; i < rgba.length; i += 16) {
    sampled++
    const d = nearestAllowedDeltaE(rgba[i], rgba[i + 1], rgba[i + 2])
    if (d > tolerance) bad += 1
  }
  return bad / sampled
}
