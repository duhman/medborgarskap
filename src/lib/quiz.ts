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

export function percentCorrect(score: number, total: number): number {
  if (total === 0) return 0
  return Math.round((score / total) * 100)
}
