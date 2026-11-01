import { describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createHash } from 'node:crypto'
import {
  assertBudget,
  buildDecisionRequest,
  classifyAnswer,
  loadExperimentItems,
  parseArgs,
  redactFailure,
  requestDecision,
  run,
  worstCaseCostUsd,
} from '../benchmark/run-decisions.mjs'

const item = {
  id: 'support:test',
  kind: 'supported_by_passage',
  source: { fixtureId: 'test', provenance: 'agent/synthetic/unreviewed' },
  sourceHash: 'source',
  responseHash: 'response',
  expectedStructuralSignal: true,
  publicInput: 'Approved public passage: safe fact.',
  question: { type: 'predicate', name: 'support_test', instructions: 'Is this supported?' },
}

const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}

const hash = (value) => createHash('sha256').update(value).digest('hex')

describe('Decisions experiment runner', () => {
  it('defaults to a bounded dry run and requires an explicit live budget', () => {
    expect(parseArgs([])).toMatchObject({ live: false, maxCases: 10, mode: 'all', split: 'development', timeoutMs: 15_000 })
    expect(() => parseArgs(['--live'])).toThrow('--live requires --budget-usd')
    expect(() => parseArgs(['--max-cases', '51'])).toThrow('must not exceed 50')
  })

  it('builds the documented Decisions request without unsupported retention controls', () => {
    const request = buildDecisionRequest(item)
    expect(request.body).toEqual({ model: 'gpt-6-luna', input: item.publicInput, questions: [item.question] })
    expect(request.body).not.toHaveProperty('store')
    expect(request.body.questions).toHaveLength(1)
  })

  it('uses the Decisions endpoint and interprets a predicate answer', async () => {
    let received
    const result = await requestDecision({
      apiKey: 'test-key',
      request: buildDecisionRequest(item),
      fetchImpl: async (url, init) => {
        received = { url, init }
        return new Response(JSON.stringify({ model: 'gpt-6-luna', answers: [{ type: 'predicate', name: 'support_test', probability: 0.8 }], usage: { input_tokens: 17 } }), { status: 200 })
      },
    })
    expect(received.url).toBe('https://api.openai.com/v1/decisions')
    expect(received.init.method).toBe('POST')
    expect(JSON.parse(received.init.body)).toMatchObject({ model: 'gpt-6-luna', questions: [{ type: 'predicate' }] })
    expect(result).toEqual({ status: 'answered', value: 0.8, inputTokens: 17 })
  })

  it('handles refusal, malformed response, quota, and budget without exposing provider bodies', async () => {
    expect(classifyAnswer({ type: 'refusal', name: 'support_test' }, item.question)).toEqual({ status: 'refusal' })
    expect(classifyAnswer({ type: 'predicate', name: 'support_test' }, item.question)).toEqual({ status: 'malformed_response' })
    const quota = await requestDecision({ apiKey: 'test-key', request: buildDecisionRequest(item), fetchImpl: async () => new Response('sensitive provider body', { status: 429 }) })
    expect(quota).toEqual({ status: 'provider_error', error: 'rate_or_quota', httpStatus: 429 })
    const credits = await requestDecision({ apiKey: 'test-key', request: buildDecisionRequest(item), fetchImpl: async () => new Response('sensitive provider body', { status: 402 }) })
    expect(credits).toEqual({ status: 'provider_error', error: 'insufficient_credits', httpStatus: 402 })
    expect(() => assertBudget([{ ...buildDecisionRequest(item) }], 0.000000001)).toThrow('DECISIONS_BUDGET')
    const request = buildDecisionRequest(item)
    expect(worstCaseCostUsd([request])).toBe((request.requestBytes + 1024) * 0.5 / 1_000_000)
    expect(redactFailure(new Error('Bearer sk-secret'))).not.toContain('sk-secret')
  })

  it('does not leak policy answer labels or IDs into the Decisions input and keeps canonical support to the chosen split', () => {
    const policies = loadExperimentItems({ mode: 'abstain', split: 'development', maxCases: 50, responses: null, includeSynthetic: false })
    expect(policies[0].publicInput).not.toContain('abstain_with_source')
    expect(policies[0].publicInput).not.toContain('cite_and_qualify')
    expect(policies[0].publicInput).not.toContain('future-exam-date-unknown')
    expect(policies[0].question.name).not.toContain('future-exam-date-unknown')
    const support = loadExperimentItems({ mode: 'support', split: 'development', maxCases: 50, responses: null, includeSynthetic: false })
    expect(support).not.toHaveLength(0)
    expect(support.every((entry) => entry.source.split === 'development')).toBe(true)
  })

  it('uses only each fixture’s approved URL-scoped facts, including the explicit app disclaimer', () => {
    const policies = loadExperimentItems({ mode: 'abstain', split: 'development', maxCases: 50, responses: null, includeSynthetic: false })
    const migrationOnly = policies.find((entry) => entry.source?.sourceUrls?.length === 1 && entry.source.sourceUrls[0]?.includes('medborgarskapsprovetisvenskakanflyttasfram'))
    expect(migrationOnly.publicInput).toContain('MV_SWEDISH_TEST_DELAY_2026_10_24')
    expect(migrationOnly.publicInput).not.toContain('uhr:status:2026-11-01')
    expect(migrationOnly.publicInput).not.toContain('app:disclaimer:2026-11-01')
    const appFixture = policies.find((entry) => entry.source?.sourceUrls?.includes('https://provamedborgarskap.se/om'))
    expect(appFixture.publicInput).toContain('app:disclaimer:2026-11-01')
    expect(appFixture.publicInput).toContain('Vi är inte knutna till UHR, Skolverket eller Migrationsverket.')
  })

  it('aborts a request that exceeds the deadline and validates returned answer bounds', async () => {
    let wasAborted = false
    const timeout = await requestDecision({
      apiKey: 'test-key', request: buildDecisionRequest(item), timeoutMs: 1,
      fetchImpl: async (_url, init) => new Promise((resolve) => init.signal.addEventListener('abort', () => { wasAborted = true; resolve(new Response('{}', { status: 499 })) })),
    })
    expect(timeout).toEqual({ status: 'timeout' })
    expect(wasAborted).toBe(true)
    expect(classifyAnswer({ type: 'predicate', name: 'support_test', probability: 1.01 }, item.question)).toEqual({ status: 'malformed_response' })
  })

  it('filters mixed runner logs before validating completed canonical feedback provenance', () => {
    const directory = mkdtempSync(join(tmpdir(), 'decisions-feedback-test-'))
    try {
      const sources = JSON.parse(readFileSync('benchmark/medborgarskap-v1.sources.json', 'utf8'))
      const cases = readFileSync('benchmark/medborgarskap-v1.jsonl', 'utf8').trim().split('\n').map((line) => JSON.parse(line))
      const policy = JSON.parse(readFileSync('benchmark/medborgarskap-policy-v1.json', 'utf8'))
      const manifest = JSON.parse(readFileSync('benchmark/medborgarskap-v1.manifest.json', 'utf8'))
      const benchmarkCase = cases.find((entry) => entry.split === 'development')
      const corpusDigest = hash(stableJson({ corpusVersion: manifest.version, corpusReviewStatus: manifest.reviewStatus, questions: sources, cases, policyFixtures: policy.fixtures }))
      const outputText = 'Kort offentlig benchmarktext.'
      writeFileSync(join(directory, 'run.json'), JSON.stringify({ corpusDigest, requestFingerprint: 'requests-v1', selectedCaseIds: [benchmarkCase.id], runIdentity: 'run-v1' }))
      writeFileSync(join(directory, 'attempts.jsonl'), [
        JSON.stringify({ inputProvenance: 'policy-fixture-public-official-urls', outcome: 'completed', acceptedAnswer: true }),
        JSON.stringify({ inputProvenance: 'canonical-public-benchmark', outcome: 'failed', acceptedAnswer: false, caseId: benchmarkCase.id }),
        JSON.stringify({
          schemaVersion: 1, inputProvenance: 'canonical-public-benchmark', outcome: 'completed', acceptedAnswer: true,
          caseId: benchmarkCase.id, questionId: benchmarkCase.questionId, outputText, outputFingerprint: hash(outputText),
          corpusDigest, benchmarkCorpusDigest: corpusDigest, requestFingerprint: 'requests-v1', requestBodyFingerprint: 'body-v1', runIdentity: 'run-v1',
        }),
      ].join('\n'))
      const entries = loadExperimentItems({ mode: 'feedback', split: 'development', maxCases: 10, responses: join(directory, 'attempts.jsonl'), includeSynthetic: false })
      expect(entries).toHaveLength(1)
      expect(entries[0]).toMatchObject({ kind: 'feedback_quality', id: `feedback:${benchmarkCase.id}`, responseHash: hash(outputText) })
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('does not make a network request in dry-run output', async () => {
    let calls = 0
    const result = await run({ live: false, mode: 'support', split: 'development', maxCases: 1, budgetUsd: null, output: null, responses: null, includeSynthetic: false, timeoutMs: 15_000 }, {
      fetchImpl: async () => { calls += 1 },
    })
    expect(calls).toBe(0)
    expect(JSON.stringify(result)).not.toContain('user-private-input')
    expect(result.summary.interpretation).toBe('dry_run_no_network_request')
  })

  it('writes only hashes and classified results, never the source or user input text', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'decisions-runner-test-'))
    const output = join(directory, 'result.jsonl')
    try {
      await run({ live: true, mode: 'support', split: 'development', maxCases: 1, budgetUsd: 1, output, responses: null, includeSynthetic: false, timeoutMs: 15_000 }, {
        environment: { OPENAI_API_KEY: 'test-key' },
        fetchImpl: async () => new Response(JSON.stringify({ model: 'gpt-6-luna', answers: [{ type: 'predicate', name: 'support_k1_q1', probability: 0.5 }], usage: { input_tokens: 12 } }), { status: 200 }),
      })
      const record = readFileSync(output, 'utf8')
      expect(record).not.toContain('publicInput')
      expect(record).not.toContain('user-private-input')
      expect(record).not.toContain('Approved public source passage')
      await expect(run({ live: true, mode: 'support', split: 'development', maxCases: 1, budgetUsd: 1, output, responses: null, includeSynthetic: false, timeoutMs: 15_000 }, {
        environment: { OPENAI_API_KEY: 'test-key' }, fetchImpl: async () => new Response('{}', { status: 200 }),
      })).rejects.toThrow('DECISIONS_OUTPUT_EXISTS')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
