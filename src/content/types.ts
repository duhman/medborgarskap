export type QuestionSource = {
  chapter: number
  page?: number
  /**
   * Kort ordagrant utdrag ur Sverige i fokus (en mening eller del av en) som stöder rätt svar.
   * scripts/check-quotes.mjs kontrollerar att det finns på angiven sida i PDF:en.
   */
  quote?: string
}

/** Granskning av ett kapitels frågor mot en viss version av Sverige i fokus. */
export type ChapterReview = {
  /** Datum (YYYY-MM-DD) då frågorna senast kontrollerades mot PDF:en. */
  reviewedAt: string
  /** Versionsdatum för PDF:en som frågorna granskades mot, t.ex. korrigerad version 2026-08-10. */
  pdfVersion: string
}

export type GlossaryTerm = {
  term: string
  /** Förklaring på lätt svenska. */
  sv: string
  en: string
}

export type QuizOption = {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
}

export type QuizQuestion = {
  id: string
  prompt: string
  options: QuizOption[]
  correctOptionId: QuizOption['id']
  explanationSv: string
  explanationEn?: string
  source: QuestionSource
}

export type ChapterContent = {
  slug: string
  number: number
  title: string
  mp3Url: string
  intro: string
  bullets?: string[]
  questions: QuizQuestion[]
  isStub?: boolean
  /** Kort sammanfattning på lätt svenska, några stycken. */
  summaryEasy?: string[]
  glossary?: GlossaryTerm[]
  review?: ChapterReview
}

export function validateQuestion(q: QuizQuestion): string[] {
  const errors: string[] = []
  if (q.options.length !== 4) {
    errors.push(`Question ${q.id}: must have exactly 4 options`)
  }
  const ids = new Set(q.options.map((o) => o.id))
  if (ids.size !== 4 || !ids.has('A') || !ids.has('B') || !ids.has('C') || !ids.has('D')) {
    errors.push(`Question ${q.id}: options must be A, B, C, D`)
  }
  if (!q.options.some((o) => o.id === q.correctOptionId)) {
    errors.push(`Question ${q.id}: correctOptionId must match an option`)
  }
  if (!q.explanationSv.trim()) {
    errors.push(`Question ${q.id}: explanationSv is required`)
  }
  if (q.source.chapter < 1 || q.source.chapter > 13) {
    errors.push(`Question ${q.id}: source.chapter must be 1-13`)
  }
  return errors
}

export function validateChapterQuestions(questions: QuizQuestion[]): string[] {
  return questions.flatMap(validateQuestion)
}
