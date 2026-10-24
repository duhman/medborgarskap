import type { QuizOption, QuizQuestion } from '../content/types'

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Record<string, QuizOption['id'] | undefined>,
): { score: number; total: number } {
  let score = 0
  for (const q of questions) {
    if (answers[q.id] === q.correctOptionId) score += 1
  }
  return { score, total: questions.length }
}

export function formatSource(source: { chapter: number; page?: number }): string {
  if (source.page != null) {
    return `Kapitel ${source.chapter}, sida ${source.page} (Sverige i fokus)`
  }
  return `Kapitel ${source.chapter} (Sverige i fokus)`
}

/** Fisher-Yates shuffle of option ids, so the right answer is not always in the same place. */
export function shuffleOptionIds(
  ids: QuizOption['id'][],
  random: () => number = Math.random,
): QuizOption['id'][] {
  const out = [...ids]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Small deterministic PRNG (mulberry32) seeded from a string, so server and client agree. */
export function seededRandom(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Options in display order, shuffled per question id so the right answer is spread over A-D. */
export function displayOptions(q: QuizQuestion): QuizOption[] {
  const ids = shuffleOptionIds(
    q.options.map((o) => o.id),
    seededRandom(q.id),
  )
  return ids.map((id) => q.options.find((o) => o.id === id)).filter((o): o is QuizOption => !!o)
}

export function percentCorrect(score: number, total: number): number {
  if (total === 0) return 0
  return Math.round((score / total) * 100)
}
