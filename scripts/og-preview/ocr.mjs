import { createWorker } from 'tesseract.js'

const FORBIDDEN_WORDS = ['officiell', 'UHR', '%', 'kr', 'AI', 'frågor sitter']

const FORBIDDEN_PAIRS = [
  ['Politiska val och partier', 'Hur ofta hålls val'],
  ['Rätt svar', 'kapitel övade'],
  ['Hur ofta hålls val', 'Plugga till medborgarskapsprovet'],
  ['Plugga till medborgarskapsprovet', 'Politiska val och partier'],
]

/** Required OCR fragments per beat (brief section 7). */
export function requiredForBeat(beat) {
  const always = ['Medborgarskap', 'provamedborgarskap.se']
  switch (beat) {
    case 'listen':
      return [...always, ['Politiska', 'partier', 'val och partier']]
    case 'quiz-q':
      return [...always, ['Hur ofta hålls val']]
    case 'quiz-r':
      return [...always, ['Hur ofta', 'hålls val'], ['Rätt', 'RÄTT', 'svar'], ['14', 'Kapitel']]
    case 'plan-3':
      return [...always, ['3 av 13', '3 av 13 kapitel'], ['kapitel övade']]
    case 'plan-4':
      return [...always, ['4 av 13', '4 av 13 kapitel'], ['kapitel övade']]
    case 'tagline':
      return [...always, ['Plugga', 'medborgarskapsprovet'], ['källa', 'Med rätt']]
    case 'trans':
      return ['Medborgarskap']
    default:
      return always
  }
}

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function includesAny(text, options) {
  if (typeof options === 'string') return text.includes(options)
  return options.some((o) => text.includes(o))
}

export function ocrViolations(text, beat) {
  const problems = []
  const t = normalize(text)
  if (!t && beat !== 'trans') {
    problems.push(`OCR empty on beat ${beat}`)
    return problems
  }

  for (const w of FORBIDDEN_WORDS) {
    const re = w.length <= 3 ? new RegExp(`\\b${w}\\b`, 'i') : new RegExp(w, 'i')
    if (re.test(t)) problems.push(`forbidden word "${w}"`)
  }
  for (const [a, b] of FORBIDDEN_PAIRS) {
    if (t.includes(a) && t.includes(b)) problems.push(`forbidden pair "${a}" + "${b}"`)
  }

  for (const req of requiredForBeat(beat)) {
    if (Array.isArray(req)) {
      if (!includesAny(t, req)) problems.push(`missing one of (${req.join(' | ')}) on beat ${beat}`)
    } else if (!t.includes(req)) {
      problems.push(`missing "${req}" on beat ${beat}`)
    }
  }
  return problems
}

let workerPromise

export async function ocrPng(pngBuffer) {
  workerPromise ??= createWorker('swe+eng')
  const worker = await workerPromise
  const {
    data: { text },
  } = await worker.recognize(pngBuffer, {}, { tessedit_pageseg_mode: '6' })
  return normalize(text)
}

function linesFromBlocks(blocks) {
  const lines = []
  for (const block of blocks ?? []) {
    for (const para of block.paragraphs ?? []) {
      for (const line of para.lines ?? []) {
        const bbox = line.bbox ?? {}
        lines.push({
          text: line.text ?? '',
          h: (bbox.y1 ?? 0) - (bbox.y0 ?? 0),
          w: (bbox.x1 ?? 0) - (bbox.x0 ?? 0),
        })
      }
    }
  }
  return lines
}

/** Line boxes with height in canvas pixels (for min text height gate). */
export async function ocrWords(pngBuffer) {
  workerPromise ??= createWorker('swe+eng')
  const worker = await workerPromise
  const {
    data: { blocks },
  } = await worker.recognize(pngBuffer, {}, { tessedit_pageseg_mode: '6', blocks: true })
  return linesFromBlocks(blocks)
}

export async function terminateOcr() {
  if (workerPromise) {
    const worker = await workerPromise
    await worker.terminate()
    workerPromise = undefined
  }
}
