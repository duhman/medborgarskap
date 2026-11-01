import { describe, expect, it } from 'vitest'
import { handleTutor } from '../../api/tutor.js'
import { practiceDisclaimerSource } from '../config/appFacts.js'
import { policyFixtures } from '../benchmark/policy.js'
import type { TutorGeneratedResponse, TutorStorage } from '../lib/tutor.js'
import {
  createTutorBenchmarkRequest,
  createTutorService,
  isTutorProductionReleaseApproved,
  parseTutorModelOutput,
  parseTutorRequest,
  readTutorRuntimeConfig,
  resolveTutorSourceContext,
  responseOutputText,
  resolveTutorPolicyContext,
  TUTOR_CORPUS_DIGEST,
  TUTOR_RELEASE_GATE,
  TUTOR_SETTINGS_FINGERPRINT,
  validateCachedTutorResponse,
  tutorAvailability,
} from './tutor.js'

const request = { questionId: 'k1-q1', selectedOptionId: 'B' as const, language: 'sv' as const, intent: 'misconception' as const, consent: true as const, privacyVersion: '2026-11-01' as const }

function storage(overrides: Partial<TutorStorage> = {}): TutorStorage {
  return {
    reserve: async () => ({ kind: 'granted', reservationId: 'r'.repeat(16) }),
    settle: async () => undefined,
    getCached: async () => undefined,
    setCached: async () => undefined,
    ...overrides,
  }
}

describe('grounded tutor contract', () => {
  it('accepts only the exact, consented identifier request shape', () => {
    expect(parseTutorRequest(request)).toEqual(request)
    expect(parseTutorRequest({ ...request, history: [] })).toBeUndefined()
    expect(parseTutorRequest({ ...request, consent: false })).toBeUndefined()
    expect(parseTutorRequest({ ...request, selectedOptionId: 'X' })).toBeUndefined()
  })

  it('builds a Responses schema request with no tools, credentials, or client free text', () => {
    const built = createTutorBenchmarkRequest(request)
    expect(built?.request.url).toBe('https://api.openai.com/v1/responses')
    expect(built?.request.body).toMatchObject({ store: false, service_tier: 'default', model: 'gpt-6.1-terra' })
    expect(built?.request.body).not.toHaveProperty('tools')
    expect(JSON.stringify(built?.request.body)).not.toContain('OPENAI_API_KEY')
    expect(built?.context.chapterSlug).toBe('landet-sverige')
  })

  it('rejects unsupported citations and oversized model fields before display', () => {
    const context = resolveTutorSourceContext(request)!
    const quote = context.sources[0]!.quote
    expect(parseTutorModelOutput({ mode: 'explanation', explanation: 'Kort förklaring.', example: null, checkQuestion: null, citations: [{ sourceId: context.sources[0]!.sourceId, quote }] }, context)).toBeDefined()
    expect(parseTutorModelOutput({ mode: 'explanation', explanation: 'Kort förklaring.', example: null, checkQuestion: null, citations: [{ sourceId: 'invented', quote }] }, context)).toBeUndefined()
    expect(parseTutorModelOutput({ mode: 'explanation', explanation: 'x'.repeat(1_401), example: null, checkQuestion: null, citations: [{ sourceId: context.sources[0]!.sourceId, quote }] }, context)).toBeUndefined()
  })

  it('extracts structured text from the raw Responses REST output array and rejects incomplete responses', () => {
    expect(responseOutputText({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '{"mode":"abstain"}' }] }] })).toBe('{"mode":"abstain"}')
    expect(responseOutputText({ status: 'incomplete', output: [{ content: [{ type: 'output_text', text: 'partial' }] }] })).toBeUndefined()
  })

  it('never injects a policy source outside that fixture allowlist', () => {
    for (const fixture of policyFixtures) {
      expect(resolveTutorPolicyContext(fixture.sourceUrls).every((source) => fixture.sourceUrls.includes(source.url))).toBe(true)
    }
    const migrationsverket = policyFixtures.find((fixture) => fixture.id === 'swedish-test-delay-is-not-cancellation')!
    expect(resolveTutorPolicyContext(migrationsverket.sourceUrls).some((source) => source.authority === 'UHR')).toBe(false)
    const app = policyFixtures.find((fixture) => fixture.id === 'app-not-officially-endorsed')!
    expect(resolveTutorPolicyContext(app.sourceUrls)).toContainEqual(practiceDisclaimerSource)
  })

  it('does not admit multi-source FAQ claims into an overview-only policy context', () => {
    const overviewOnly = resolveTutorPolicyContext(['https://www.uhr.se/medborgarskapsprovet/om-medborgarskapsprovet/'])
    const prompt = overviewOnly.map((source) => source.quote).join('\n')
    expect(prompt).not.toContain('28 av 40')
    expect(prompt).not.toContain('utprövningsprov')
    expect(overviewOnly.every((source) => source.authority === 'UHR')).toBe(true)
  })

  it('accepts cache only when every field and canonical citation metadata matches', () => {
    const context = resolveTutorSourceContext(request)!
    const source = context.sources[0]!
    const valid = { outcome: 'generated', explanation: 'Kontrollerad.', example: null, checkQuestion: null, citations: [{ sourceId: source.sourceId, quote: source.quote, quoteOffset: source.quoteOffset, url: source.url, authority: source.authority, checkedAt: source.checkedAt }], sourceVersion: context.sourceVersion, sourceHash: context.sourceHash }
    expect(validateCachedTutorResponse(valid, context)).toMatchObject({ outcome: 'generated', citations: [{ url: source.url }] })
    expect(validateCachedTutorResponse({ ...valid, citations: [] }, context)).toBeUndefined()
    expect(validateCachedTutorResponse({ ...valid, citations: [{ ...source, quoteOffset: 1 }] }, context)).toBeUndefined()
    expect(validateCachedTutorResponse({ ...valid, sourceHash: 'wrong' }, context)).toBeUndefined()
  })

  it('falls back on abstention, stale cache, and non-pilot chapter without calling untrusted output', async () => {
    const stale: TutorGeneratedResponse = { outcome: 'generated', explanation: 'stale', example: null, checkQuestion: null, citations: [], sourceVersion: 'stale', sourceHash: 'stale' }
    let calls = 0
    const service = createTutorService({
      config: { enabled: true, localReview: true, model: readTutorRuntimeConfig({ OPENAI_TUTOR_ENABLED: 'true', OPENAI_TUTOR_LOCAL_REVIEW: 'true' }).model, credential: 'test' },
      storage: storage({ getCached: async () => stale }),
      provider: { generate: async () => { calls++; return { kind: 'success', outputText: JSON.stringify({ mode: 'abstain', explanation: 'Saknar stöd.', example: null, checkQuestion: null, citations: [{ sourceId: resolveTutorSourceContext(request)!.sources[0]!.sourceId, quote: resolveTutorSourceContext(request)!.sources[0]!.quote }] }), inputTokens: 1, outputTokens: 1, cacheWriteInputTokens: 0 } } },
    })
    const fallback = await service.help(request, new AbortController().signal, 'subject')
    expect(fallback).not.toBe('not_available')
    expect(fallback).not.toBe('rate_limited')
    if (typeof fallback === 'string') throw new Error('Expected an authored fallback.')
    expect(fallback.outcome).toBe('fallback')
    expect(calls).toBe(1)
    const other = await service.help({ ...request, questionId: 'k2-q30' }, new AbortController().signal, 'subject')
    expect(other).toMatchObject({ outcome: 'fallback' })
    expect(calls).toBe(1)
  })

  it('rejects a source-hash-matching cache payload with an unsafe citation and rebuilds from provider output', async () => {
    const context = resolveTutorSourceContext(request)!
    const source = context.sources[0]!
    const poisoned = {
      outcome: 'generated' as const, explanation: 'Poisoned', example: null, checkQuestion: null,
      citations: [{ sourceId: source.sourceId, quote: source.quote, quoteOffset: 0, url: 'javascript:alert(1)', authority: source.authority, checkedAt: source.checkedAt }],
      sourceVersion: context.sourceVersion, sourceHash: context.sourceHash,
    }
    let calls = 0
    const service = createTutorService({
      config: { enabled: true, localReview: true, model: readTutorRuntimeConfig({ OPENAI_TUTOR_ENABLED: 'true', OPENAI_TUTOR_LOCAL_REVIEW: 'true' }).model, credential: 'test' },
      storage: storage({ getCached: async () => poisoned }),
      provider: { generate: async () => { calls++; return { kind: 'success', outputText: JSON.stringify({ mode: 'explanation', explanation: 'Kontrollerad.', example: null, checkQuestion: null, citations: [{ sourceId: source.sourceId, quote: source.quote }] }) } } },
    })
    const result = await service.help(request, new AbortController().signal, 'subject')
    expect(calls).toBe(1)
    expect(result).toMatchObject({ outcome: 'generated', explanation: 'Kontrollerad.', citations: [{ url: source.url }] })
    expect(JSON.stringify(result)).not.toContain('javascript:')
  })

  it('settles known usage with the same conservative regional margin as reservation', async () => {
    const context = resolveTutorSourceContext(request)!
    const source = context.sources[0]!
    let settled: number | undefined
    const service = createTutorService({
      config: { enabled: true, localReview: true, model: readTutorRuntimeConfig({ OPENAI_TUTOR_ENABLED: 'true', OPENAI_TUTOR_LOCAL_REVIEW: 'true' }).model, credential: 'test' },
      storage: storage({ settle: async ({ actualCostMicroUsd }) => { settled = actualCostMicroUsd } }),
      provider: { generate: async () => ({ kind: 'success', outputText: JSON.stringify({ mode: 'explanation', explanation: 'Kontrollerad.', example: null, checkQuestion: null, citations: [{ sourceId: source.sourceId, quote: source.quote }] }), inputTokens: 2, outputTokens: 2, cacheReadInputTokens: 0, cacheWriteInputTokens: 0 }) },
    })
    expect(await service.help(request, new AbortController().signal, 'subject')).toMatchObject({ outcome: 'generated' })
    // Terra standard estimate is 12 micro-USD for 2 input + 2 output tokens; 25% safety margin settles 15.
    expect(settled).toBe(15)
  })

  it('fails closed by default and keeps the endpoint same-origin with no permissive CORS', async () => {
    const config = readTutorRuntimeConfig({})
    expect(tutorAvailability(config, undefined)).toEqual({ available: false, chapterSlugs: ['landet-sverige'], privacyVersion: '2026-11-01' })
    const hostile = await handleTutor(new Request('https://provamedborgarskap.se/api/tutor', { method: 'POST', headers: { host: 'provamedborgarskap.se', origin: 'https://evil.example', 'content-type': 'application/json' }, body: JSON.stringify(request) }))
    expect(hostile.status).toBe(403)
    expect(hostile.headers.get('access-control-allow-origin')).toBeNull()
    const unavailable = await handleTutor(new Request('https://provamedborgarskap.se/api/tutor', { method: 'POST', headers: { host: 'provamedborgarskap.se', origin: 'https://provamedborgarskap.se', 'content-type': 'application/json' }, body: JSON.stringify(request) }))
    expect(unavailable.status).toBe(503)
  })

  it('passes cancellation to the provider and never caches partial output', async () => {
    let observedAbort = false
    let cached = false
    const controller = new AbortController()
    controller.abort()
    const service = createTutorService({
      config: { enabled: true, localReview: true, model: readTutorRuntimeConfig({ OPENAI_TUTOR_ENABLED: 'true', OPENAI_TUTOR_LOCAL_REVIEW: 'true' }).model, credential: 'test' },
      storage: storage({ setCached: async () => { cached = true } }),
      provider: { generate: async (_request, signal) => { observedAbort = signal.aborted; return { kind: 'failure' } } },
    })
    expect(await service.help(request, controller.signal, 'subject')).toMatchObject({ outcome: 'fallback' })
    expect(observedAbort).toBe(true)
    expect(cached).toBe(false)
  })

  it('requires an immutable corpus, prompt, model and two-reviewer release record before production can enable', () => {
    const pending = readTutorRuntimeConfig({ OPENAI_TUTOR_ENABLED: 'true', NODE_ENV: 'production' })
    expect(pending.enabled).toBe(false)
    expect(TUTOR_RELEASE_GATE).toMatchObject({ status: 'pending', corpusDigest: 'pending-human-review', settingsFingerprint: 'pending-human-review' })
    const approved = { status: 'approved' as const, corpusVersion: '2026-11-01.v1', corpusDigest: TUTOR_CORPUS_DIGEST, promptVersion: 'grounded-tutor-v1', settingsFingerprint: TUTOR_SETTINGS_FINGERPRINT, model: 'gpt-6.1-terra', reviewedSamples: 500, reviewersPerSample: 2, factualSupportRate: 1, usefulnessRate: 0.95, policyFixturesPassed: 12, policyFixturesTotal: 12, attestations: [{ reviewerId: 'reviewer-one', attestedAt: '2026-11-01' }, { reviewerId: 'reviewer-two', attestedAt: '2026-11-01' }] }
    expect(isTutorProductionReleaseApproved(approved, 'gpt-6.1-terra')).toBe(true)
    expect(isTutorProductionReleaseApproved({ ...approved, policyFixturesPassed: 1, policyFixturesTotal: 1 }, 'gpt-6.1-terra')).toBe(false)
    expect(isTutorProductionReleaseApproved({ ...approved, corpusDigest: 'reviewed-prior-corpus-hash' }, 'gpt-6.1-terra')).toBe(false)
    expect(isTutorProductionReleaseApproved({ ...approved, settingsFingerprint: 'reviewed-prior-settings-hash' }, 'gpt-6.1-terra')).toBe(false)
    expect(readTutorRuntimeConfig({ OPENAI_TUTOR_ENABLED: 'true', NODE_ENV: 'production' }, approved).enabled).toBe(true)
  })
})
