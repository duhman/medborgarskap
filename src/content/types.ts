export type QuestionSource = {
  chapter: number
  page?: number
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
