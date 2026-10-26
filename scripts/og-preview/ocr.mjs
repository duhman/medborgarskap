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
      return [...always, ['Stoppa', 'Lyssna', 'uppläsningen'], ['Politiska', 'partier']]
    case 'quiz-q':
      return [...always, ['Hur ofta hålls val']]
    case 'quiz-r':
      return [...always, ['Hur ofta', 'hålls val'], ['Rätt', 'RÄTT', 'svar'], ['14', 'Kapitel']]
    case 'plan-3':
      return [...always, ['3 av 13', '3 av 13 kapitel'], ['kapitel övade']]
    case 'plan-4':
      return [...always, ['4 av 13', '4 av 13 kapitel'], ['kapitel övade']]
    case 'tagline':
      return [...always, ['Plugga till medborgarskapsprovet', 'Plugga'], ['källa']]
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
    if (t.includes(w)) problems.push(`forbidden word "${w}"`)
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

export async function terminateOcr() {
  if (workerPromise) {
    const worker = await workerPromise
    await worker.terminate()
    workerPromise = undefined
  }
}
