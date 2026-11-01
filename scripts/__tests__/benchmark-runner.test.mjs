import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildReviewPacket, prepareReviewAttempts, runBenchmark } from '../benchmark/run-models.mjs'
import { REQUEST_TOKEN_OVERHEAD, createWorkItems, ensureProductionRequest, estimateInputTokens, parseArgs, sha256 } from '../benchmark/support.mjs'

const secretName = ['OPENAI', 'API', 'KEY'].join('_')

function fixtures() {
  const benchmarkCase = {
    id: 'case-1', split: 'development', chapterSlug: 'landet-sverige', chapterNumber: 1,
    questionId: 'question-1', category: 'misconception', prompt: 'Förklara.', expected: 'explain_from_evidence',
    source: { quote: 'En offentlig källa.', supplementarySources: [{ url: 'https://www.uhr.se/kalla' }] }, humanSemanticReview: 'pending',
  }
  return {
    corpus: { version: 'v1', reviewStatus: 'pending', cases: [benchmarkCase] },
    policyFixtures: [{
      id: 'future-unknown', prompt: 'När är nästa prov?', expected: 'abstain_with_source',
      requiredAssertions: ['Abstain.'], forbiddenAssertions: ['Invent a date.'], sourceUrls: ['https://www.uhr.se/kalla'], humanSemanticReview: 'pending',
    }],
  }
}

function adapter() {
  return {
    promptVersion: 'grounded-tutor-v1',
    async buildRequest({ model, benchmarkCase, policyFixture }) {
      return {
        body: { model, store: false, max_output_tokens: 64, input: benchmarkCase?.prompt ?? policyFixture?.prompt, text: { format: { type: 'json_schema' } } },
        maxOutputTokens: 64,
        sourceUrls: ['https://public.example/source'],
      }
    },
    parseResponse() { return { mode: 'explanation', explanation: 'Stöd i den angivna källan.', example: null, checkQuestion: null, citations: [{ sourceId: 'source-1', quote: 'En offentlig källa.' }] } },
    validateResponse() { return { format: 'valid' } },
  }
}

function liveOptions(overrides = {}) {
  return {
    live: true, split: 'development', model: 'gpt-6.1-terra', maxCases: 1, maxConcurrency: 1,
    timeoutMs: 5_000, resume: false, budgetUsd: 1, inputUsdPerMillion: 1, outputUsdPerMillion: 5,
    ...overrides,
  }
}

function successfulResponse() {
  return {
    ok: true, status: 200,
    async json() {
      return {
        status: 'completed', usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
        output: [{ content: [{ type: 'output_text', text: '{"explanation":"Stöd"}' }] }],
      }
    },
  }
}

function delayedSuccessfulResponse(delayMs) {
  return {
    ok: true, status: 200,
    async json() {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      return {
        status: 'completed', usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
        output: [{ content: [{ type: 'output_text', text: '{"explanation":"Stöd"}' }] }],
      }
    },
  }
}

describe('benchmark runner options', () => {
  it('is dry by default and requires an explicit hard budget plus pricing to spend', () => {
    expect(parseArgs([])).toMatchObject({ live: false, split: 'development', maxCases: 10, maxConcurrency: 1 })
    expect(() => parseArgs(['--live'])).toThrow('--budget-usd')
    expect(() => parseArgs(['--live', '--budget-usd', '2'])).toThrow('input-usd-per-million')
    expect(() => parseArgs(['--max-concurrency', '4'])).toThrow('must not exceed 3')
    expect(parseArgs(['--max-cases', '650'])).toMatchObject({ maxCases: 650 })
    expect(() => parseArgs(['--max-cases', '651'])).toThrow('must not exceed 650')
    expect(parseArgs(['--split', 'heldout', '--model', 'gpt-6-luna', '--out', '/tmp/benchmark-out'])).toMatchObject({ split: 'heldout', model: 'gpt-6-luna', output: '/tmp/benchmark-out' })
  })

  it('uses a conservative UTF-8 input-token reservation and exact output cap', () => {
    const ascii = { input: 'aaaa', store: false, max_output_tokens: 420 }
    const multibyte = { input: 'åååå', store: false, max_output_tokens: 420 }
    expect(estimateInputTokens(ascii)).toBeGreaterThanOrEqual(Buffer.byteLength(JSON.stringify(ascii), 'utf8') + REQUEST_TOKEN_OVERHEAD)
    expect(estimateInputTokens(multibyte)).toBeGreaterThan(estimateInputTokens(ascii))
    expect(() => ensureProductionRequest({ body: ascii, maxOutputTokens: 1 })).toThrow('exact match')
    expect(ensureProductionRequest({ body: ascii, maxOutputTokens: 420 })).toBeTruthy()
    expect(() => parseArgs(['--live', '--budget-usd', '1', '--input-usd-per-million', '0', '--output-usd-per-million', '1'])).toThrow('positive number')
  })

  it('selects development cases round-robin across chapters before taking another chapter case', () => {
    const caseFor = (chapterNumber, suffix) => ({ id: `case-${chapterNumber}-${suffix}`, split: 'development', chapterSlug: `chapter-${chapterNumber}`, chapterNumber, source: { supplementarySources: [] } })
    const corpus = { cases: [caseFor(1, 1), caseFor(1, 2), caseFor(2, 1), caseFor(2, 2), caseFor(3, 1)] }
    expect(createWorkItems(corpus, [], 'development', 4).map((item) => item.id)).toEqual(['case-1-1', 'case-2-1', 'case-3-1', 'case-1-2'])
  })

  it('selects 500 unique heldout cases across every chapter before any heldout generation run', () => {
    const cases = Array.from({ length: 13 * 50 }, (_, index) => {
      const chapterNumber = Math.floor(index / 50) + 1
      return { id: `heldout-${chapterNumber}-${index % 50}`, split: 'heldout', chapterSlug: `chapter-${chapterNumber}`, chapterNumber, source: { supplementarySources: [] } }
    })
    const selected = createWorkItems({ cases }, [], 'heldout', 500)
    expect(selected).toHaveLength(500)
    expect(new Set(selected.map((item) => item.id)).size).toBe(500)
    expect(new Set(selected.map((item) => item.benchmarkCase.chapterNumber)).size).toBe(13)
  })
})

describe('benchmark runner', () => {
  it('uses the production-shaped request with store:false and no tools, then records raw attempts', async () => {
    const { corpus, policyFixtures } = fixtures()
    const calls = []
    const outputDirectory = mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-'))
    const result = await runBenchmark({
      options: liveOptions(), corpus, policyFixtures, adapter: adapter(), outputDirectory,
      environment: { [secretName]: 'test-credential' },
      fetchImpl: async (url, request) => { calls.push({ url, request }); return successfulResponse() },
    })
    expect(calls).toHaveLength(2)
    expect(calls[0].url).toBe('https://api.openai.com/v1/responses')
    expect(calls[0].request.method).toBe('POST')
    expect(calls[0].request.headers).toMatchObject({ authorization: 'Bearer test-credential', 'content-type': 'application/json' })
    expect(JSON.parse(calls[0].request.body)).toMatchObject({ store: false })
    expect(JSON.parse(calls[0].request.body)).not.toHaveProperty('tools')
    expect(result.attempts).toHaveLength(2)
    expect(result.attempts.every((attempt) => attempt.outcome === 'completed')).toBe(true)
    expect(result.attempts.every((attempt) => attempt.billing === 'estimated_only_not_account_billed')).toBe(true)
    expect(result.attempts.every((attempt) => attempt.sourceUrls[0] === 'https://public.example/source')).toBe(true)
    const benchmarkAttempt = result.attempts.find((attempt) => attempt.inputProvenance === 'canonical-public-benchmark')
    expect(benchmarkAttempt).toMatchObject({ questionId: 'question-1', benchmarkCorpusDigest: result.plan.corpusDigest, requestFingerprint: result.plan.requestFingerprint })
    expect(benchmarkAttempt.outputText).toContain('explanation')
    expect(benchmarkAttempt.outputFingerprint).toBe(sha256(benchmarkAttempt.outputText))
    expect(readFileSync(join(outputDirectory, 'attempts.jsonl'), 'utf8').trim().split('\n')).toHaveLength(2)
    expect(readFileSync(join(outputDirectory, 'reservations.jsonl'), 'utf8').trim().split('\n')).toHaveLength(2)
  })

  it('honors --out through parsed options so resume and packet export share one directory', async () => {
    const { corpus, policyFixtures } = fixtures()
    const output = join(mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-parent-')), 'requested-output')
    const result = await runBenchmark({
      options: liveOptions({ output }), corpus, policyFixtures, adapter: adapter(),
      environment: { [secretName]: 'test-credential' }, fetchImpl: async () => successfulResponse(),
    })
    expect(result.outputDirectory).toBe(output)
    expect(existsSync(join(output, 'run.json'))).toBe(true)
    expect(existsSync(join(output, 'attempts.jsonl'))).toBe(true)
  })

  it('records end-to-end latency after the delayed body and validation path', async () => {
    const { corpus, policyFixtures } = fixtures()
    const result = await runBenchmark({
      options: liveOptions(), corpus, policyFixtures, adapter: adapter(), outputDirectory: mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-')),
      environment: { [secretName]: 'test-credential' }, fetchImpl: async () => delayedSuccessfulResponse(25),
    })
    expect(result.attempts.every((attempt) => attempt.latencyMs >= 20)).toBe(true)
    expect(result.attempts.every((attempt) => attempt.headersLatencyMs !== null && attempt.headersLatencyMs < attempt.latencyMs)).toBe(true)
  })

  it('does not duplicate chargeable attempts on an identical resume', async () => {
    const { corpus, policyFixtures } = fixtures()
    const outputDirectory = mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-'))
    let calls = 0
    const fetchImpl = async () => { calls++; return successfulResponse() }
    const input = { options: liveOptions(), corpus, policyFixtures, adapter: adapter(), outputDirectory, environment: { [secretName]: 'test-credential' }, fetchImpl }
    await runBenchmark(input)
    const resumed = await runBenchmark({ ...input, options: liveOptions({ resume: true }) })
    expect(calls).toBe(2)
    expect(resumed.attempts).toHaveLength(0)
  })

  it('fails closed on an unresolved reservation rather than sending a duplicate request', async () => {
    const { corpus, policyFixtures } = fixtures()
    const outputDirectory = mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-'))
    let calls = 0
    const input = {
      options: liveOptions(), corpus, policyFixtures, adapter: adapter(), outputDirectory,
      environment: { [secretName]: 'test-credential' }, fetchImpl: async () => { calls++; return successfulResponse() },
    }
    await runBenchmark(input)
    writeFileSync(join(outputDirectory, 'attempts.jsonl'), '')
    const resumed = await runBenchmark({ ...input, options: liveOptions({ resume: true }) })
    expect(calls).toBe(2)
    expect(resumed.attempts).toHaveLength(0)
  })

  it('persists each completed attempt before another concurrent request finishes', async () => {
    const { corpus, policyFixtures } = fixtures()
    const outputDirectory = mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-'))
    let invocation = 0
    let releaseSecond
    const second = new Promise((resolve) => { releaseSecond = resolve })
    const run = runBenchmark({
      options: liveOptions({ maxConcurrency: 2 }), corpus, policyFixtures, adapter: adapter(), outputDirectory,
      environment: { [secretName]: 'test-credential' },
      fetchImpl: async () => {
        invocation++
        if (invocation === 2) return second
        return successfulResponse()
      },
    })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(readFileSync(join(outputDirectory, 'attempts.jsonl'), 'utf8').trim().split('\n')).toHaveLength(1)
    releaseSecond(successfulResponse())
    await run
  })

  it('reserves before calling and fails closed before an over-budget run', async () => {
    const { corpus, policyFixtures } = fixtures()
    let calls = 0
    await expect(runBenchmark({
      options: liveOptions({ budgetUsd: 0.000001 }), corpus, policyFixtures, adapter: adapter(),
      outputDirectory: mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-')),
      environment: { [secretName]: 'test-credential' }, fetchImpl: async () => { calls++; return successfulResponse() },
    })).rejects.toThrow('BENCHMARK_BUDGET')
    expect(calls).toBe(0)
  })

  it('keeps provider failures in the denominator and redacts request errors', async () => {
    const { corpus, policyFixtures } = fixtures()
    let invocation = 0
    const result = await runBenchmark({
      options: liveOptions(), corpus, policyFixtures, adapter: adapter(), outputDirectory: mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-')),
      environment: { [secretName]: 'test-credential' },
      fetchImpl: async () => {
        invocation++
        if (invocation === 1) return { ok: false, status: 429, async json() { return {} } }
        throw new Error('Bearer test-credential sk-example-secret')
      },
    })
    expect(result.attempts).toHaveLength(2)
    expect(result.attempts[0]).toMatchObject({ outcome: 'failed', acceptedAnswer: false, failureCategory: 'rate_or_quota' })
    expect(result.attempts[1]).toMatchObject({ outcome: 'failed', acceptedAnswer: false, failureCategory: 'request_error' })
    expect(result.attempts[1].error).not.toContain('test-credential')
    expect(result.attempts[1].error).not.toContain('sk-example-secret')
  })

  it('does not accept insufficient-credit or malformed provider responses', async () => {
    const { corpus, policyFixtures } = fixtures()
    let invocation = 0
    const result = await runBenchmark({
      options: liveOptions(), corpus, policyFixtures, adapter: adapter(), outputDirectory: mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-')),
      environment: { [secretName]: 'test-credential' },
      fetchImpl: async () => {
        invocation++
        return invocation === 1
          ? { ok: false, status: 402, async json() { return {} } }
          : { ok: true, status: 200, async json() { throw new Error('not json') } }
      },
    })
    expect(result.attempts.map((attempt) => attempt.failureCategory)).toEqual(['insufficient_credits', 'malformed_provider_response'])
    expect(result.attempts.every((attempt) => attempt.acceptedAnswer === false)).toBe(true)
  })

  it('does not accept a parsed response that violates the tutor structured-output shape', async () => {
    const { corpus, policyFixtures } = fixtures()
    const malformedAdapter = { ...adapter(), parseResponse() { return { explanation: 'missing required fields' } } }
    const result = await runBenchmark({
      options: liveOptions(), corpus, policyFixtures, adapter: malformedAdapter, outputDirectory: mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-')),
      environment: { [secretName]: 'test-credential' }, fetchImpl: async () => successfulResponse(),
    })
    expect(result.attempts.every((attempt) => attempt.failureCategory === 'invalid_structured_output' && attempt.acceptedAnswer === false)).toBe(true)
    expect(result.attempts.every((attempt) => attempt.outputText?.includes('explanation') && attempt.outputFingerprint)).toBe(true)
  })

  it('creates a blind review packet with two pending reviewer fields', () => {
    const packet = buildReviewPacket([{ caseId: 'case-1', outcome: 'completed', expected: 'explain_from_evidence', sourceUrls: ['https://www.uhr.se/kalla'], reviewEvidence: { questionPrompt: 'Vad gäller?', options: [{ id: 'A', text: 'Svar A' }], selectedOptionId: 'A', correctOptionId: 'A', sources: [{ authority: 'UHR', checkedAt: '2026-11-01', url: 'https://www.uhr.se/kalla', quote: 'Stöd i källan.' }] }, response: { explanation: 'Stöd i källan.' } }])
    expect(packet).toContain('Candidate A')
    expect(packet).toContain('Reviewer 1')
    expect(packet).toContain('Reviewer 2')
    expect(packet).toContain('Approved evidence: UHR')
    expect(packet).toContain('at least 500 reviewed cases')
  })

  it('recovers and displays all accepted generated fields from hash-verified historical output', () => {
    const outputText = JSON.stringify({ mode: 'explanation', explanation: 'Stöd i källan.', example: 'Ett exempel.', checkQuestion: 'Vad säger källan?', citations: [{ sourceId: 'source-1', quote: 'Stöd i källan.' }] })
    const packet = buildReviewPacket([{ caseId: 'case-1', outcome: 'completed', acceptedAnswer: true, outputText, outputFingerprint: sha256(outputText) }])
    expect(packet).toContain('- Mode: explanation')
    expect(packet).toContain('- Example: Ett exempel.')
    expect(packet).toContain('- Check question: Vad säger källan?')
  })

  it('does not invent generated fields from invalid historical output JSON', () => {
    const outputText = 'not tutor JSON'
    const packet = buildReviewPacket([{ caseId: 'case-1', outcome: 'completed', acceptedAnswer: true, outputText, outputFingerprint: sha256(outputText) }])
    expect(packet).toContain('Unavailable: accepted output text is not valid tutor JSON.')
    expect(packet).not.toContain('- Mode: explanation')
  })

  it('shows the actual source-unknown learner prompt in a review packet', async () => {
    const { corpus, policyFixtures } = fixtures()
    corpus.cases[0] = { ...corpus.cases[0], category: 'source_unknown', prompt: 'Vad blir den exakta regeln nästa år? Om källan inte säger det ska du säga att det är okänt.' }
    const result = await runBenchmark({
      options: liveOptions(), corpus, policyFixtures, adapter: adapter(), outputDirectory: mkdtempSync(join(tmpdir(), 'medborgarskap-benchmark-')),
      environment: { [secretName]: 'test-credential' }, fetchImpl: async () => successfulResponse(),
    })
    const packet = buildReviewPacket(result.attempts)
    expect(packet).toContain('Vad blir den exakta regeln nästa år?')
  })

  it('declines historical learner-prompt reconstruction when the corpus digest differs', () => {
    const { corpus, policyFixtures } = fixtures()
    const reviewAttempts = prepareReviewAttempts([{ caseId: 'case-1', outcome: 'completed', acceptedAnswer: true }], {
      corpus, policyFixtures, currentCorpusDigest: 'current-corpus-digest', historicalCorpusDigest: 'different-historical-digest',
    })
    expect(reviewAttempts[0].learnerPrompt).toBeNull()
    const packet = buildReviewPacket(reviewAttempts)
    expect(packet).toContain('historical corpus digest does not match')
    expect(packet).not.toContain('- Learner prompt: Förklara.')
  })

  it('declines historical learner-prompt reconstruction when the prepared request body differs', () => {
    const { corpus, policyFixtures } = fixtures()
    const reviewAttempts = prepareReviewAttempts([{ caseId: 'case-1', outcome: 'completed', acceptedAnswer: true, requestBodyFingerprint: 'historical-body' }], {
      corpus, policyFixtures, currentCorpusDigest: 'matching-corpus-digest', historicalCorpusDigest: 'matching-corpus-digest',
      requestBodyFingerprints: new Map([['case-1', 'current-body']]),
    })
    expect(reviewAttempts[0].learnerPrompt).toBeNull()
    expect(buildReviewPacket(reviewAttempts)).toContain('historical request-body fingerprint does not match')
  })

  it('reconstructs a historical learner prompt only with matching corpus and request fingerprints', () => {
    const { corpus, policyFixtures } = fixtures()
    const reviewAttempts = prepareReviewAttempts([{ caseId: 'case-1', requestBodyFingerprint: 'matching-body' }], {
      corpus, policyFixtures, currentCorpusDigest: 'matching-corpus', historicalCorpusDigest: 'matching-corpus',
      requestBodyFingerprints: new Map([['case-1', 'matching-body']]),
    })
    expect(reviewAttempts[0]).toMatchObject({ learnerPrompt: 'Förklara.', learnerPromptStatus: 'reconstructed_from_matching_corpus' })
  })
})
