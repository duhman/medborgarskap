import { createHash } from 'node:crypto'
import { allChapters } from '../content/chapters/all.js'
import { SOURCE_PDF_VERSION, pdfPageUrl } from '../content/chapters/meta.js'
import { uhrStatus } from '../config/status.js'
import { policyFixtures } from '../benchmark/policy.js'
import { faqEntries } from '../content/faq.js'
import { practiceDisclaimerSource } from '../config/appFacts.js'
import type { ChapterContent, QuizQuestion, SupplementarySource } from '../content/types.js'
import {
  TUTOR_PILOT_CHAPTER_SLUGS,
  TUTOR_PRIVACY_VERSION,
  TUTOR_PROMPT_VERSION,
  type TutorAvailability,
  type TutorCitation,
  type TutorFallbackResponse,
  type TutorGeneratedResponse,
  type TutorModelOutput,
  type TutorOptionId,
  type TutorRequest,
  type TutorResponse,
  type TutorStorage,
} from '../lib/tutor.js'
import { createTutorStorageFromEnvironment } from './tutorStorage.js'

const RESPONSES_URL = 'https://api.openai.com/v1/responses'
const MAX_OUTPUT_TOKENS = 420
const CACHE_TTL_MS = 10 * 60 * 1000
const MAX_EXPLANATION_LENGTH = 1_400
const MAX_EXAMPLE_LENGTH = 700
const MAX_CHECK_QUESTION_LENGTH = 320
const MAX_CITATIONS = 3
const MAX_QUOTE_LENGTH = 800
const COST_RESERVATION_MARGIN = 1.25
const TUTOR_INSTRUCTION_RULES = [
  'You are an optional study tutor for a Swedish citizenship practice app.',
  'Use only the approved excerpts. Do not add current facts, legal advice, personal eligibility guidance, exam dates, scores, or claims not supported by an excerpt.',
  'If the excerpts cannot support a helpful explanation, use mode "abstain" and say that approved material is insufficient.',
  'Do not change, grade, or discuss the answer key beyond explaining this completed practice question.',
  'Every factual statement needs an exact source citation. Quote membership does not prove semantic entailment, so stay narrow and literal.',
] as const
// Keep this equal to the benchmark corpus version. The release record below must be reviewed when it changes.
export const TUTOR_BENCHMARK_CORPUS_VERSION = '2026-11-01.v1'

export type TutorEnvironment = Record<string, string | undefined>

const canonicalJson = (value: unknown) => JSON.stringify(value)
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export type TutorSource = TutorCitation & { kind: 'primary' | 'supplementary' }

export type TutorSourceContext = {
  chapterSlug: string
  chapterTitle: string
  questionId: string
  questionPrompt: string
  options: Array<{ id: TutorOptionId; text: string }>
  correctOptionId: TutorOptionId
  selectedOptionId: TutorOptionId | null
  authoredExplanation: string
  lessonContext: string
  sources: TutorSource[]
  sourceVersion: string
  sourceHash: string
}

export type TutorModelProfile = {
  model: string
  inputMicroUsdPerMillion: number
  cacheReadInputMicroUsdPerMillion: number
  cacheWriteInputMicroUsdPerMillion: number
  outputMicroUsdPerMillion: number
  maxOutputTokens: number
}

export const TUTOR_MODEL_PROFILES: Record<string, TutorModelProfile> = {
  'gpt-6.1-terra': { model: 'gpt-6.1-terra', inputMicroUsdPerMillion: 1_000_000, cacheReadInputMicroUsdPerMillion: 50_000, cacheWriteInputMicroUsdPerMillion: 1_250_000, outputMicroUsdPerMillion: 5_000_000, maxOutputTokens: MAX_OUTPUT_TOKENS },
  'gpt-6.1-sol': { model: 'gpt-6.1-sol', inputMicroUsdPerMillion: 2_000_000, cacheReadInputMicroUsdPerMillion: 100_000, cacheWriteInputMicroUsdPerMillion: 2_500_000, outputMicroUsdPerMillion: 10_000_000, maxOutputTokens: MAX_OUTPUT_TOKENS },
  'gpt-6-luna': { model: 'gpt-6-luna', inputMicroUsdPerMillion: 100_000, cacheReadInputMicroUsdPerMillion: 10_000, cacheWriteInputMicroUsdPerMillion: 125_000, outputMicroUsdPerMillion: 500_000, maxOutputTokens: MAX_OUTPUT_TOKENS },
}

export type TutorProviderRequest = { url: typeof RESPONSES_URL; headers: Record<'content-type', string>; body: Record<string, unknown> }
export type TutorProviderResult =
  | { kind: 'success'; outputText: string; inputTokens?: number; outputTokens?: number; cacheReadInputTokens?: number; cacheWriteInputTokens?: number }
  | { kind: 'retryable'; retryAfterMs?: number }
  | { kind: 'failure' }
export type TutorProvider = { generate(request: TutorProviderRequest, signal: AbortSignal): Promise<TutorProviderResult> }
export type TutorBenchmarkInput = Pick<TutorRequest, 'questionId' | 'selectedOptionId' | 'language' | 'intent'> & { model?: string }
export type TutorRuntimeConfig = { enabled: boolean; localReview: boolean; model: TutorModelProfile; credential: string | undefined }

export type TutorReleaseGate = {
  status: 'pending' | 'approved'
  corpusVersion: string
  corpusDigest: string
  promptVersion: string
  settingsFingerprint: string
  model: string
  reviewedSamples: number
  reviewersPerSample: number
  factualSupportRate: number
  usefulnessRate: number
  policyFixturesPassed: number
  policyFixturesTotal: number
  attestations: Array<{ reviewerId: string; attestedAt: string }>
}

export const TUTOR_CORPUS_DIGEST = sha256(stableJson({ chapters: allChapters, policyFixtures, status: uhrStatus, faqEntries, practiceDisclaimerSource }))
export const TUTOR_SETTINGS_FINGERPRINT = sha256(stableJson({ promptVersion: TUTOR_PROMPT_VERSION, model: 'gpt-6.1-terra', maxOutputTokens: MAX_OUTPUT_TOKENS, serviceTier: 'default', instructionRules: TUTOR_INSTRUCTION_RULES, sourceProjection: ['question', 'options', 'selectedOption', 'correctOption', 'authoredExplanation', 'lessonContext', 'primaryAndSupplementarySources'], schema: outputSchema() }))

export const TUTOR_RELEASE_GATE: TutorReleaseGate = {
  status: 'pending',
  corpusVersion: TUTOR_BENCHMARK_CORPUS_VERSION,
  // Activation must replace these literal reviewed pins after the two-reviewer gate.
  // Do not derive them from live constants: that would silently bless later corpus/prompt drift.
  corpusDigest: 'pending-human-review',
  promptVersion: TUTOR_PROMPT_VERSION,
  settingsFingerprint: 'pending-human-review',
  model: 'gpt-6.1-terra',
  reviewedSamples: 0,
  reviewersPerSample: 0,
  factualSupportRate: 0,
  usefulnessRate: 0,
  policyFixturesPassed: 0,
  policyFixturesTotal: 0,
  attestations: [],
}
const sourceIdForPrimary = (question: QuizQuestion) => `uhr:${SOURCE_PDF_VERSION}:page:${question.source.page ?? 'unknown'}`
const sourceIdForSupplementary = (question: QuizQuestion, index: number) => `supplementary:${question.id}:${index + 1}`

function sourceFromSupplementary(question: QuizQuestion, source: SupplementarySource, index: number): TutorSource {
  return { kind: 'supplementary', sourceId: sourceIdForSupplementary(question, index), quote: source.quote, quoteOffset: 0, url: source.url, authority: source.publisher, checkedAt: source.checkedAt }
}

function lessonContext(chapter: ChapterContent) {
  return [chapter.intro, ...(chapter.bullets ?? []), ...(chapter.summaryEasy ?? [])].filter(Boolean).join('\n\n')
}

function englishFallback(question: QuizQuestion) {
  return question.explanationEn?.trim() || question.explanationSv
}

function findQuestion(questionId: string) {
  for (const chapter of allChapters) {
    const question = chapter.questions.find((candidate) => candidate.id === questionId)
    if (question) return { chapter, question }
  }
  return undefined
}

export function resolveTutorSourceContext(input: TutorBenchmarkInput): TutorSourceContext | undefined {
  const match = findQuestion(input.questionId)
  const primaryQuote = match?.question.source.quote?.trim()
  if (!match || !primaryQuote) return undefined
  const { chapter, question } = match
  const sources: TutorSource[] = [
    { kind: 'primary', sourceId: sourceIdForPrimary(question), quote: primaryQuote, quoteOffset: 0, url: pdfPageUrl(question.source.page), authority: 'UHR', checkedAt: chapter.review?.reviewedAt ?? null },
    ...(question.source.supplementarySources ?? []).map((source, index) => sourceFromSupplementary(question, source, index)),
  ]
  const stable = {
    chapterSlug: chapter.slug,
    chapterTitle: chapter.title,
    questionId: question.id,
    questionPrompt: question.prompt,
    options: question.options,
    correctOptionId: question.correctOptionId,
    selectedOptionId: input.selectedOptionId,
    authoredExplanation: input.language === 'en' ? englishFallback(question) : question.explanationSv,
    lessonContext: lessonContext(chapter),
    sources,
    sourceVersion: `${SOURCE_PDF_VERSION}:${chapter.review?.pdfVersion ?? 'unreviewed'}`,
  }
  return { ...stable, sourceHash: sha256(canonicalJson(stable)) }
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]) {
  const expected = [...keys].sort()
  const actual = Object.keys(value).sort()
  return actual.length === expected.length && actual.every((key, index) => key === expected[index])
}

export function parseTutorRequest(value: unknown): TutorRequest | undefined {
  if (!value || Array.isArray(value) || typeof value !== 'object') return undefined
  const request = value as Record<string, unknown>
  if (!hasExactKeys(request, ['questionId', 'selectedOptionId', 'language', 'intent', 'consent', 'privacyVersion'])) return undefined
  if (typeof request.questionId !== 'string' || request.questionId.length === 0 || request.questionId.length > 128) return undefined
  if (request.selectedOptionId !== null && !['A', 'B', 'C', 'D'].includes(String(request.selectedOptionId))) return undefined
  if (request.language !== 'sv' && request.language !== 'en') return undefined
  if (request.intent !== 'simplify' && request.intent !== 'misconception') return undefined
  if (request.consent !== true) return undefined
  if (request.privacyVersion !== TUTOR_PRIVACY_VERSION) return undefined
  return request as TutorRequest
}

function isBoundedString(value: unknown, maximum: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum
}

/** Validates source-ID membership and exact quote membership. It is not an entailment proof. */
export function parseTutorModelOutput(value: unknown, context: TutorSourceContext): TutorModelOutput | undefined {
  if (!value || Array.isArray(value) || typeof value !== 'object') return undefined
  const output = value as Record<string, unknown>
  if (!hasExactKeys(output, ['mode', 'explanation', 'example', 'checkQuestion', 'citations'])) return undefined
  if (output.mode !== 'explanation' && output.mode !== 'abstain') return undefined
  if (!isBoundedString(output.explanation, MAX_EXPLANATION_LENGTH)) return undefined
  if (output.example !== null && !isBoundedString(output.example, MAX_EXAMPLE_LENGTH)) return undefined
  if (output.checkQuestion !== null && !isBoundedString(output.checkQuestion, MAX_CHECK_QUESTION_LENGTH)) return undefined
  if (!Array.isArray(output.citations) || output.citations.length < 1 || output.citations.length > MAX_CITATIONS) return undefined
  const explanation = output.explanation as string
  const citations: Array<{ sourceId: string; quote: string }> = []
  const seen = new Set<string>()
  for (const citation of output.citations) {
    if (!citation || Array.isArray(citation) || typeof citation !== 'object') return undefined
    const candidate = citation as Record<string, unknown>
    if (!hasExactKeys(candidate, ['sourceId', 'quote'])) return undefined
    if (typeof candidate.sourceId !== 'string' || !isBoundedString(candidate.quote, MAX_QUOTE_LENGTH)) return undefined
    const source = context.sources.find((item) => item.sourceId === candidate.sourceId)
    const identifier = `${candidate.sourceId}\u0000${candidate.quote}`
    const quote = candidate.quote as string
    if (!source || !source.quote.includes(quote) || seen.has(identifier)) return undefined
    seen.add(identifier)
    citations.push({ sourceId: candidate.sourceId, quote })
  }
  return {
    mode: output.mode,
    explanation: explanation.trim(),
    example: typeof output.example === 'string' ? output.example.trim() : null,
    checkQuestion: typeof output.checkQuestion === 'string' ? output.checkQuestion.trim() : null,
    citations,
  }
}

function enrichCitations(modelOutput: TutorModelOutput, context: TutorSourceContext): TutorCitation[] | undefined {
  const citations: TutorCitation[] = []
  for (const citation of modelOutput.citations) {
    const source = context.sources.find((item) => item.sourceId === citation.sourceId)
    const quoteOffset = source?.quote.indexOf(citation.quote) ?? -1
    if (!source || quoteOffset < 0) return undefined
    citations.push({ sourceId: source.sourceId, quote: citation.quote, quoteOffset, url: source.url, authority: source.authority, checkedAt: source.checkedAt })
  }
  return citations
}

function outputSchema() {
  return {
    type: 'object', additionalProperties: false, required: ['mode', 'explanation', 'example', 'checkQuestion', 'citations'],
    properties: {
      mode: { type: 'string', enum: ['explanation', 'abstain'] },
      explanation: { type: 'string', minLength: 1, maxLength: MAX_EXPLANATION_LENGTH },
      example: { type: ['string', 'null'], maxLength: MAX_EXAMPLE_LENGTH },
      checkQuestion: { type: ['string', 'null'], maxLength: MAX_CHECK_QUESTION_LENGTH },
      citations: { type: 'array', minItems: 1, maxItems: MAX_CITATIONS, items: {
        type: 'object', additionalProperties: false, required: ['sourceId', 'quote'],
        properties: { sourceId: { type: 'string', minLength: 1, maxLength: 128 }, quote: { type: 'string', minLength: 1, maxLength: MAX_QUOTE_LENGTH } },
      } },
    },
  }
}

function tutorInstruction(context: TutorSourceContext, input: TutorBenchmarkInput) {
  const language = input.language === 'sv' ? 'Swedish' : 'English'
  const selectedOption = input.selectedOptionId ? context.options.find((option) => option.id === input.selectedOptionId)?.text : undefined
  return [
    TUTOR_INSTRUCTION_RULES[0],
    `Reply only in ${language}.`,
    ...TUTOR_INSTRUCTION_RULES.slice(1),
    `Intent: ${input.intent}.`, `Question: ${context.questionPrompt}`,
    `Options: ${context.options.map((option) => `${option.id}. ${option.text}`).join('\n')}`,
    `Selected option: ${selectedOption ?? 'No option selected'}`, `Correct option: ${context.correctOptionId}.`,
    `Authored study explanation: ${context.authoredExplanation}`, `Lesson context: ${context.lessonContext}`,
    'Approved sources:',
    ...context.sources.map((source) => `[${source.sourceId}] authority=${source.authority}; checkedAt=${source.checkedAt ?? 'not separately dated'}; url=${source.url}\n${source.quote}`),
  ].join('\n\n')
}

function profileFor(model: string | undefined) {
  return TUTOR_MODEL_PROFILES[model ?? 'gpt-6.1-terra'] ?? TUTOR_MODEL_PROFILES['gpt-6.1-terra']
}

/** Pure benchmark adapter. It is valid for all chapters and has no credentials, tools, or pilot gate. */
export function createTutorBenchmarkRequest(input: TutorBenchmarkInput): { request: TutorProviderRequest; context: TutorSourceContext } | undefined {
  const context = resolveTutorSourceContext(input)
  if (!context) return undefined
  const profile = profileFor(input.model)
  return {
    context,
    request: {
      url: RESPONSES_URL,
      headers: { 'content-type': 'application/json' },
      body: {
        model: profile.model,
        store: false,
        service_tier: 'default',
        max_output_tokens: profile.maxOutputTokens,
        input: tutorInstruction(context, input),
        text: { format: { type: 'json_schema', name: 'grounded_tutor', strict: true, schema: outputSchema() } },
      },
    },
  }
}

export function responseOutputText(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const response = raw as { output_text?: unknown; output?: unknown; status?: unknown }
  if (response.status !== undefined && response.status !== 'completed') return undefined
  if (typeof response.output_text === 'string') return response.output_text
  if (!Array.isArray(response.output)) return undefined
  const texts: string[] = []
  for (const item of response.output) {
    if (!item || typeof item !== 'object' || !Array.isArray((item as { content?: unknown }).content)) continue
    for (const content of (item as { content: unknown[] }).content) {
      const candidate = content && typeof content === 'object' ? content as { type?: unknown; text?: unknown } : undefined
      if (candidate?.type === 'output_text' && typeof candidate.text === 'string') texts.push(candidate.text)
    }
  }
  return texts.length ? texts.join('') : undefined
}

export function parseTutorProviderResponse(raw: unknown, context: TutorSourceContext): TutorModelOutput | undefined {
  const outputText = typeof raw === 'string' ? raw : responseOutputText(raw)
  if (!outputText || outputText.length > 16 * 1024) return undefined
  try { return parseTutorModelOutput(JSON.parse(outputText), context) } catch { return undefined }
}

function parseRetryAfter(value: string | null) {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(Math.ceil(seconds * 1_000), 2_000)
  const date = Date.parse(value)
  return Number.isNaN(date) ? undefined : Math.min(Math.max(0, date - Date.now()), 2_000)
}

function usageValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined
}

/** Native-fetch Responses provider. It deliberately exposes no provider response or error details. */
export function createOpenAiTutorProvider(credential: string, fetchImpl: typeof fetch = fetch): TutorProvider {
  return {
    async generate(request, signal) {
      try {
        const headers = new Headers(request.headers)
        headers.set('authorization', `Bearer ${credential}`)
        const response = await fetchImpl(request.url, { method: 'POST', headers, body: JSON.stringify(request.body), signal })
        if (response.status === 429 || response.status === 503) return { kind: 'retryable', retryAfterMs: parseRetryAfter(response.headers.get('retry-after')) }
        if (!response.ok) return { kind: 'failure' }
        const payload = (await response.json()) as { usage?: { input_tokens?: unknown; output_tokens?: unknown; input_tokens_details?: { cache_read_tokens?: unknown; cache_write_tokens?: unknown } } }
        const outputText = responseOutputText(payload)
        if (!outputText) return { kind: 'failure' }
        return { kind: 'success', outputText, inputTokens: usageValue(payload.usage?.input_tokens), outputTokens: usageValue(payload.usage?.output_tokens), cacheReadInputTokens: usageValue(payload.usage?.input_tokens_details?.cache_read_tokens), cacheWriteInputTokens: usageValue(payload.usage?.input_tokens_details?.cache_write_tokens) }
      } catch {
        return { kind: 'failure' }
      }
    },
  }
}

function wait(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds)
    signal.addEventListener('abort', () => { clearTimeout(timer); reject(new Error('aborted')) }, { once: true })
  })
}

function estimateWorstCaseCostMicroUsd(request: TutorProviderRequest, profile: TutorModelProfile) {
  // Every request byte can require a token in the worst case; add protocol/schema overhead.
  // This is a conservative operational reservation, not an invoice or regional-price guarantee.
  const inputTokensUpperBound = new TextEncoder().encode(JSON.stringify(request.body)).byteLength + 1_024
  const oneAttempt = Math.ceil((inputTokensUpperBound * profile.cacheWriteInputMicroUsdPerMillion + profile.maxOutputTokens * profile.outputMicroUsdPerMillion) / 1_000_000)
  return Math.ceil(oneAttempt * 2 * COST_RESERVATION_MARGIN)
}

function actualCostMicroUsd(result: Extract<TutorProviderResult, { kind: 'success' }>, profile: TutorModelProfile) {
  // Usage-based standard-rate estimate only. Regional/account billing can differ, so unknown details retain the reservation.
  if (result.inputTokens === undefined || result.outputTokens === undefined || result.cacheReadInputTokens === undefined || result.cacheWriteInputTokens === undefined) return undefined
  const standardInput = Math.max(0, result.inputTokens - result.cacheReadInputTokens - result.cacheWriteInputTokens)
  const standardEstimate = Math.ceil((standardInput * profile.inputMicroUsdPerMillion + result.cacheReadInputTokens * profile.cacheReadInputMicroUsdPerMillion + result.cacheWriteInputTokens * profile.cacheWriteInputMicroUsdPerMillion + result.outputTokens * profile.outputMicroUsdPerMillion) / 1_000_000)
  return Math.ceil(standardEstimate * COST_RESERVATION_MARGIN)
}

function cacheKey(context: TutorSourceContext, input: TutorBenchmarkInput, profile: TutorModelProfile) {
  return sha256(canonicalJson({ questionId: context.questionId, selectedOptionId: input.selectedOptionId, language: input.language, intent: input.intent, sourceHash: context.sourceHash, sourceVersion: context.sourceVersion, promptVersion: TUTOR_PROMPT_VERSION, model: profile.model }))
}

function cacheMatches(value: TutorGeneratedResponse, context: TutorSourceContext) {
  return value.sourceHash === context.sourceHash && value.sourceVersion === context.sourceVersion
}

/** Rebuild cached output from current canonical sources; cache storage is never a trust boundary. */
export function validateCachedTutorResponse(value: unknown, context: TutorSourceContext): TutorGeneratedResponse | undefined {
  if (!value || Array.isArray(value) || typeof value !== 'object') return undefined
  const cached = value as Record<string, unknown>
  if (!hasExactKeys(cached, ['outcome', 'explanation', 'example', 'checkQuestion', 'citations', 'sourceVersion', 'sourceHash'])) return undefined
  if (cached.outcome !== 'generated' || !cacheMatches(cached as TutorGeneratedResponse, context) || !Array.isArray(cached.citations)) return undefined
  const modelOutput = parseTutorModelOutput({
    mode: 'explanation',
    explanation: cached.explanation,
    example: cached.example,
    checkQuestion: cached.checkQuestion,
    citations: cached.citations.map((citation) => {
      if (!citation || Array.isArray(citation) || typeof citation !== 'object') return citation
      const record = citation as Record<string, unknown>
      return { sourceId: record.sourceId, quote: record.quote }
    }),
  }, context)
  if (!modelOutput) return undefined
  const citations = enrichCitations(modelOutput, context)
  if (!citations || citations.length !== cached.citations.length) return undefined
  for (let index = 0; index < citations.length; index++) {
    const cachedCitation = cached.citations[index]
    if (!cachedCitation || Array.isArray(cachedCitation) || typeof cachedCitation !== 'object') return undefined
    const record = cachedCitation as Record<string, unknown>
    const expected = citations[index]!
    if (!hasExactKeys(record, ['sourceId', 'quote', 'quoteOffset', 'url', 'authority', 'checkedAt'])) return undefined
    if (record.sourceId !== expected.sourceId || record.quote !== expected.quote || record.quoteOffset !== expected.quoteOffset || record.url !== expected.url || record.authority !== expected.authority || record.checkedAt !== expected.checkedAt) return undefined
  }
  return {
    outcome: 'generated',
    explanation: modelOutput.explanation,
    example: modelOutput.example,
    checkQuestion: modelOutput.checkQuestion,
    citations,
    sourceVersion: context.sourceVersion,
    sourceHash: context.sourceHash,
  }
}

function fallbackFor(context: TutorSourceContext): TutorFallbackResponse {
  return { outcome: 'fallback', explanation: context.authoredExplanation, example: null, checkQuestion: null, citations: context.sources, sourceVersion: context.sourceVersion, sourceHash: context.sourceHash }
}

export function isTutorProductionReleaseApproved(gate: TutorReleaseGate, model: string) {
  return gate.status === 'approved' &&
    gate.corpusVersion === TUTOR_BENCHMARK_CORPUS_VERSION &&
    gate.corpusDigest === TUTOR_CORPUS_DIGEST &&
    gate.promptVersion === TUTOR_PROMPT_VERSION &&
    gate.settingsFingerprint === TUTOR_SETTINGS_FINGERPRINT &&
    gate.model === model &&
    gate.reviewedSamples >= 500 &&
    gate.reviewersPerSample >= 2 &&
    gate.factualSupportRate >= 1 &&
    gate.usefulnessRate >= 0.95 &&
    gate.policyFixturesTotal === policyFixtures.length &&
    gate.policyFixturesTotal > 0 &&
    gate.policyFixturesPassed === gate.policyFixturesTotal &&
    gate.attestations.length >= 2 &&
    new Set(gate.attestations.map((attestation) => attestation.reviewerId.trim()).filter(Boolean)).size >= 2 &&
    gate.attestations.every((attestation) => /^\d{4}-\d{2}-\d{2}$/.test(attestation.attestedAt))
}

export function readTutorRuntimeConfig(environment: TutorEnvironment, releaseGate: TutorReleaseGate = TUTOR_RELEASE_GATE): TutorRuntimeConfig {
  const localReview = environment.OPENAI_TUTOR_LOCAL_REVIEW === 'true' && environment.VERCEL !== '1' && environment.NODE_ENV !== 'production'
  const model = profileFor(environment.OPENAI_TUTOR_MODEL)
  return {
    enabled: environment.OPENAI_TUTOR_ENABLED === 'true' && (localReview || isTutorProductionReleaseApproved(releaseGate, model.model)),
    localReview,
    model,
    credential: environment['OPENAI' + '_API_KEY'],
  }
}

export function tutorAvailability(config: TutorRuntimeConfig, storage: TutorStorage | undefined): TutorAvailability {
  return { available: Boolean(config.enabled && config.credential && storage), chapterSlugs: [...TUTOR_PILOT_CHAPTER_SLUGS], privacyVersion: TUTOR_PRIVACY_VERSION }
}

export type TutorService = { help(input: TutorRequest, signal: AbortSignal, subjectHash: string): Promise<TutorResponse | 'rate_limited' | 'not_available'> }

export function createTutorService(input: { config: TutorRuntimeConfig; storage: TutorStorage | undefined; provider?: TutorProvider; now?: () => number }): TutorService {
  const now = input.now ?? Date.now
  const provider = input.provider ?? (input.config.credential ? createOpenAiTutorProvider(input.config.credential) : undefined)
  return {
    async help(request, signal, subjectHash) {
      const context = resolveTutorSourceContext(request)
      if (!context) return 'not_available'
      const fallback = fallbackFor(context)
      if (!input.config.enabled || !input.config.credential || !provider || !input.storage) return fallback
      if (!TUTOR_PILOT_CHAPTER_SLUGS.includes(context.chapterSlug as (typeof TUTOR_PILOT_CHAPTER_SLUGS)[number])) return fallback
      const built = createTutorBenchmarkRequest({ ...request, model: input.config.model.model })
      if (!built) return fallback
      const key = cacheKey(context, request, input.config.model)
      try {
        const cached = await input.storage.getCached(key, signal)
        const validatedCached = validateCachedTutorResponse(cached, context)
        if (validatedCached) return validatedCached
      } catch { return fallback }
      const reservation = await input.storage.reserve({ key, subjectHash, worstCaseCostMicroUsd: estimateWorstCaseCostMicroUsd(built.request, input.config.model), nowMs: now(), signal })
      if (reservation.kind !== 'granted') return 'rate_limited'
      let providerResult: TutorProviderResult | undefined
      try {
        providerResult = await provider.generate(built.request, signal)
        if (providerResult.kind === 'retryable' && !signal.aborted) {
          await wait(providerResult.retryAfterMs ?? 100, signal)
          providerResult = await provider.generate(built.request, signal)
        }
        if (providerResult.kind !== 'success') return fallback
        const modelOutput = parseTutorProviderResponse(providerResult.outputText, context)
        if (!modelOutput || modelOutput.mode === 'abstain') return fallback
        const citations = enrichCitations(modelOutput, context)
        if (!citations) return fallback
        const generated: TutorGeneratedResponse = {
          outcome: 'generated', explanation: modelOutput.explanation, example: modelOutput.example, checkQuestion: modelOutput.checkQuestion,
          citations, sourceVersion: context.sourceVersion, sourceHash: context.sourceHash,
        }
        try { await input.storage.setCached({ key, value: generated, expiresAtMs: now() + CACHE_TTL_MS, signal }) } catch { /* cache is optional after validation */ }
        return generated
      } finally {
        try {
          const knownCost = providerResult?.kind === 'success' ? actualCostMicroUsd(providerResult, input.config.model) : undefined
          if (!signal.aborted && knownCost !== undefined) {
            await input.storage.settle({
              reservationId: reservation.reservationId,
              actualCostMicroUsd: knownCost,
              nowMs: now(),
              signal,
            })
          }
        } catch { /* fail closed: storage keeps capacity on uncertain settlement */ }
      }
    },
  }
}

export function createTutorServiceFromEnvironment(environment: TutorEnvironment = process.env): { service: TutorService; availability: TutorAvailability } {
  const config = readTutorRuntimeConfig(environment)
  const storage = createTutorStorageFromEnvironment(environment)
  return { service: createTutorService({ config, storage }), availability: tutorAvailability(config, storage) }
}

/** Compatibility exports for the offline benchmark runner. These never consult runtime flags or credentials. */
export const promptVersion = TUTOR_PROMPT_VERSION

type BenchmarkAdapterInput = {
  model: string
  benchmarkCase?: { questionId: string; category: string; prompt: string }
  policyFixture?: { prompt: string; sourceUrls: string[] }
}

const UHR_OVERVIEW_URL = 'https://www.uhr.se/medborgarskapsprovet/om-medborgarskapsprovet/'

export function resolveTutorPolicyContext(urls: string[]) {
  const status = { sourceId: 'uhr:status:2026-11-01', quote: uhrStatus.nextSitting, authority: 'UHR', url: UHR_OVERVIEW_URL, checkedAt: uhrStatus.checkedAt }
  // FAQ answers may join claims from several sources. Do not admit any of that text
  // unless this fixture explicitly allows every source the authored answer depends on.
  const faqSources = faqEntries
    .filter((entry) => entry.sources.length > 0 && entry.sources.every((source) => urls.includes(source.url)))
    .flatMap((entry) => entry.sources.map((source, index) => ({ sourceId: `faq:${entry.id}:${index + 1}`, quote: entry.answer.join(' '), authority: source.publisher, url: source.url, checkedAt: source.checkedAt })))
  return [
    ...(urls.includes(status.url) ? [status] : []),
    ...faqSources,
    ...(urls.includes(practiceDisclaimerSource.url) ? [practiceDisclaimerSource] : []),
  ]
}

function genericPolicyRequest(input: NonNullable<BenchmarkAdapterInput['policyFixture']>, model: string) {
  return {
    endpoint: RESPONSES_URL,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    body: {
      model, store: false, service_tier: 'default', max_output_tokens: MAX_OUTPUT_TOKENS,
      input: [
        'You are evaluating a source-grounded citizenship tutor.',
        'Return mode abstain unless the supplied evaluator context directly supports a narrow response.',
        'Never invent a source, date, legal decision, personal eligibility, or current requirement.',
        `Learner request (untrusted): ${input.prompt}`,
        ...resolveTutorPolicyContext(input.sourceUrls).map((source) => `[${source.sourceId}] authority=${source.authority}; checkedAt=${source.checkedAt}; url=${source.url}\n${source.quote}`),
      ].join('\n\n'),
      text: { format: { type: 'json_schema', name: 'grounded_tutor', strict: true, schema: outputSchema() } },
    },
  }
}

export function buildTutorBenchmarkRequest(input: BenchmarkAdapterInput) {
  if (input.benchmarkCase) {
    const language = input.benchmarkCase.category === 'english' ? 'en' : 'sv'
    const intent = input.benchmarkCase.category === 'misconception' ? 'misconception' : 'simplify'
    const initial = resolveTutorSourceContext({ questionId: input.benchmarkCase.questionId, selectedOptionId: null, language, intent })
    if (!initial) throw new Error('BENCHMARK_CONTEXT_UNAVAILABLE')
    const selectedOptionId = intent === 'misconception' ? initial.options.find((option) => option.id !== initial.correctOptionId)?.id ?? null : null
    const built = createTutorBenchmarkRequest({ questionId: input.benchmarkCase.questionId, selectedOptionId, language, intent, model: input.model })
    if (!built) throw new Error('BENCHMARK_CONTEXT_UNAVAILABLE')
    const body = { ...built.request.body, input: `${built.request.body.input}\n\nBenchmark learner request (untrusted): ${input.benchmarkCase.prompt}` }
    return { endpoint: built.request.url, maxOutputTokens: built.request.body.max_output_tokens as number, body, sourceUrls: built.context.sources.map((source) => source.url), reviewContext: { questionPrompt: built.context.questionPrompt, options: built.context.options, selectedOptionId, correctOptionId: built.context.correctOptionId, sources: built.context.sources } }
  }
  if (input.policyFixture) return { ...genericPolicyRequest(input.policyFixture, input.model), sourceUrls: input.policyFixture.sourceUrls, reviewContext: { prompt: input.policyFixture.prompt, sources: resolveTutorPolicyContext(input.policyFixture.sourceUrls), limitation: 'URL-only fixture sources without a matching published FAQ answer are non-citable.' } }
  throw new Error('BENCHMARK_CONTEXT_UNAVAILABLE')
}

export function parseTutorBenchmarkResponse(raw: unknown) {
  const text = responseOutputText(raw)
  if (!text || text.length > 16 * 1024) throw new Error('BENCHMARK_MODEL_OUTPUT_INVALID')
  return JSON.parse(text) as unknown
}

export function validateTutorBenchmarkResponse(parsed: unknown, input: Omit<BenchmarkAdapterInput, 'model'>) {
  if (input.benchmarkCase) {
    const language = input.benchmarkCase.category === 'english' ? 'en' : 'sv'
    const intent = input.benchmarkCase.category === 'misconception' ? 'misconception' : 'simplify'
    const initial = resolveTutorSourceContext({ questionId: input.benchmarkCase.questionId, selectedOptionId: null, language, intent })
    const selectedOptionId = intent === 'misconception' ? initial?.options.find((option) => option.id !== initial.correctOptionId)?.id ?? null : null
    const context = resolveTutorSourceContext({ questionId: input.benchmarkCase.questionId, selectedOptionId, language, intent })
    if (!context || !parseTutorModelOutput(parsed, context)) throw new Error('BENCHMARK_MODEL_OUTPUT_INVALID')
  } else if (!input.policyFixture || !parseTutorModelOutput(parsed, { chapterSlug: 'policy', chapterTitle: 'Policy', questionId: 'policy', questionPrompt: input.policyFixture.prompt, options: [], correctOptionId: 'A', selectedOptionId: null, authoredExplanation: '', lessonContext: '', sources: resolveTutorPolicyContext(input.policyFixture.sourceUrls).map((source) => ({ ...source, kind: 'supplementary', quoteOffset: 0 })), sourceVersion: uhrStatus.checkedAt, sourceHash: sha256(stableJson(resolveTutorPolicyContext(input.policyFixture.sourceUrls))) })) {
    throw new Error('BENCHMARK_MODEL_OUTPUT_INVALID')
  }
  return { format: 'valid' }
}
