/**
 * Shared, intentionally small contract for the optional source-grounded tutor.
 * The browser never supplies lesson text, sources, an answer key, or free text.
 */

export const TUTOR_PRIVACY_VERSION = '2026-11-01'
export const TUTOR_PILOT_CHAPTER_SLUGS = ['landet-sverige'] as const
export const TUTOR_PROMPT_VERSION = 'grounded-tutor-v1'

export type TutorOptionId = 'A' | 'B' | 'C' | 'D'
export type TutorLanguage = 'sv' | 'en'
export type TutorIntent = 'simplify' | 'misconception'

export type TutorRequest = {
  questionId: string
  selectedOptionId: TutorOptionId | null
  language: TutorLanguage
  intent: TutorIntent
  consent: true
  privacyVersion: typeof TUTOR_PRIVACY_VERSION
}

export type TutorAvailability = {
  available: boolean
  chapterSlugs: string[]
  privacyVersion: string
}

/** A citation after server-side source ID, quote, and offset validation. */
export type TutorCitation = {
  sourceId: string
  quote: string
  quoteOffset: number
  url: string
  authority: string
  checkedAt: string | null
}

/** The only shape a model is permitted to generate. */
export type TutorModelOutput = {
  mode: 'explanation' | 'abstain'
  explanation: string
  example: string | null
  checkQuestion: string | null
  citations: Array<{ sourceId: string; quote: string }>
}

export type TutorGeneratedResponse = {
  outcome: 'generated'
  explanation: string
  example: string | null
  checkQuestion: string | null
  citations: TutorCitation[]
  sourceVersion: string
  sourceHash: string
}

/**
 * Fallback text is authored content, never a partial or unvalidated model answer.
 * The reason is deliberately not surfaced to avoid provider or security disclosure.
 */
export type TutorFallbackResponse = {
  outcome: 'fallback'
  explanation: string
  example: null
  checkQuestion: null
  citations: TutorCitation[]
  sourceVersion: string
  sourceHash: string
}

export type TutorResponse = TutorGeneratedResponse | TutorFallbackResponse

export type TutorProblemCode = 'invalid_request' | 'unknown_question' | 'not_available' | 'rate_limited'

export type TutorProblem = { error: TutorProblemCode }

export type TutorReservation =
  | { kind: 'granted'; reservationId: string }
  | { kind: 'denied' }

/**
 * Implementations must be atomic and durable in production. `actualCostMicroUsd`
 * is undefined when usage is not known; that must retain the full reservation.
 */
export type TutorStorage = {
  reserve(input: { key: string; subjectHash: string; worstCaseCostMicroUsd: number; nowMs: number; signal: AbortSignal }): Promise<TutorReservation>
  settle(input: { reservationId: string; actualCostMicroUsd: number | undefined; nowMs: number; signal: AbortSignal }): Promise<void>
  getCached(key: string, signal: AbortSignal): Promise<TutorGeneratedResponse | undefined>
  setCached(input: { key: string; value: TutorGeneratedResponse; expiresAtMs: number; signal: AbortSignal }): Promise<void>
}
