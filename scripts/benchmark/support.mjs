import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

export const RUNNER_VERSION = '2026-11-01.v1'
export const CANDIDATE_MODELS = new Set(['gpt-6.1-terra', 'gpt-6.1-sol', 'gpt-6-luna'])
export const DEFAULT_MAX_CASES = 10
// The generated corpus has 650 heldout cases. The default remains deliberately small.
export const MAX_CASES = 650
export const DEFAULT_MAX_CONCURRENCY = 1
export const MAX_CONCURRENCY = 3
export const DEFAULT_TIMEOUT_MS = 30_000
export const REQUEST_TOKEN_OVERHEAD = 512

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export function parsePositiveNumber(value, flag, { integer = false, min = 0 } = {}) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= min || (integer && !Number.isInteger(parsed))) {
    throw new Error(`BENCHMARK_ARGUMENT: ${flag} must be a ${integer ? 'positive integer' : 'positive number'}`)
  }
  return parsed
}

export function parseArgs(argv) {
  const options = {
    live: false,
    split: 'development',
    model: 'gpt-6.1-terra',
    maxCases: DEFAULT_MAX_CASES,
    maxConcurrency: DEFAULT_MAX_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    resume: false,
    output: null,
    exportReviewPacket: null,
    budgetUsd: null,
    inputUsdPerMillion: null,
    outputUsdPerMillion: null,
  }
  const takesValue = new Map([
    ['--split', 'split'],
    ['--model', 'model'],
    ['--max-cases', 'maxCases'],
    ['--max-concurrency', 'maxConcurrency'],
    ['--timeout-ms', 'timeoutMs'],
    ['--out', 'output'],
    ['--budget-usd', 'budgetUsd'],
    ['--input-usd-per-million', 'inputUsdPerMillion'],
    ['--output-usd-per-million', 'outputUsdPerMillion'],
    ['--export-review-packet', 'exportReviewPacket'],
  ])
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index]
    if (argument === '--live') options.live = true
    else if (argument === '--resume') options.resume = true
    else if (takesValue.has(argument)) {
      const value = argv[++index]
      if (!value || value.startsWith('--')) throw new Error(`BENCHMARK_ARGUMENT: ${argument} requires a value`)
      options[takesValue.get(argument)] = value
    } else {
      throw new Error(`BENCHMARK_ARGUMENT: unknown option ${argument}`)
    }
  }
  if (!['development', 'heldout'].includes(options.split)) throw new Error('BENCHMARK_ARGUMENT: --split must be development or heldout')
  if (!CANDIDATE_MODELS.has(options.model)) throw new Error(`BENCHMARK_ARGUMENT: unsupported model ${options.model}`)
  options.maxCases = parsePositiveNumber(options.maxCases, '--max-cases', { integer: true })
  options.maxConcurrency = parsePositiveNumber(options.maxConcurrency, '--max-concurrency', { integer: true })
  options.timeoutMs = parsePositiveNumber(options.timeoutMs, '--timeout-ms', { integer: true })
  if (options.maxCases > MAX_CASES) throw new Error(`BENCHMARK_ARGUMENT: --max-cases must not exceed ${MAX_CASES}`)
  if (options.maxConcurrency > MAX_CONCURRENCY) throw new Error(`BENCHMARK_ARGUMENT: --max-concurrency must not exceed ${MAX_CONCURRENCY}`)
  if (options.live) {
    if (options.budgetUsd === null) throw new Error('BENCHMARK_ARGUMENT: --live requires --budget-usd')
    if (options.inputUsdPerMillion === null || options.outputUsdPerMillion === null) {
      throw new Error('BENCHMARK_ARGUMENT: --live requires current --input-usd-per-million and --output-usd-per-million')
    }
    options.budgetUsd = parsePositiveNumber(options.budgetUsd, '--budget-usd')
    options.inputUsdPerMillion = parsePositiveNumber(options.inputUsdPerMillion, '--input-usd-per-million')
    options.outputUsdPerMillion = parsePositiveNumber(options.outputUsdPerMillion, '--output-usd-per-million')
  }
  return options
}

export function redactError(error) {
  const message = error instanceof Error ? error.message : String(error)
  return redactSensitiveText(message)
    .slice(0, 500)
}

export function redactSensitiveText(value) {
  return value
    .replace(/Bearer\s+[^\s,;]+/gi, 'Bearer [REDACTED]')
    .replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(/api[_-]?key\s*[=:]\s*[^\s,;]+/gi, 'api_key=[REDACTED]')
}

export function estimateInputTokens(requestBody) {
  return Buffer.byteLength(JSON.stringify(requestBody), 'utf8') + REQUEST_TOKEN_OVERHEAD
}

export function estimateCostUsd({ inputTokens, outputTokens, inputUsdPerMillion, outputUsdPerMillion }) {
  return (inputTokens * inputUsdPerMillion + outputTokens * outputUsdPerMillion) / 1_000_000
}

export function usageFromResponse(response) {
  const usage = response?.usage
  if (!usage || typeof usage !== 'object') return null
  const inputTokens = Number(usage.input_tokens ?? usage.inputTokens)
  const outputTokens = Number(usage.output_tokens ?? usage.outputTokens)
  if (!Number.isFinite(inputTokens) || !Number.isFinite(outputTokens) || inputTokens < 0 || outputTokens < 0) return null
  const details = usage.input_tokens_details ?? usage.inputTokensDetails
  const cacheReadTokens = Number(details?.cached_tokens ?? details?.cachedTokens)
  const cacheWriteTokens = Number(details?.cache_write_tokens ?? details?.cacheWriteTokens)
  return {
    inputTokens,
    outputTokens,
    totalTokens: Number.isFinite(Number(usage.total_tokens ?? usage.totalTokens))
      ? Number(usage.total_tokens ?? usage.totalTokens)
      : inputTokens + outputTokens,
    cacheReadTokens: Number.isFinite(cacheReadTokens) && cacheReadTokens >= 0 ? cacheReadTokens : null,
    cacheWriteTokens: Number.isFinite(cacheWriteTokens) && cacheWriteTokens >= 0 ? cacheWriteTokens : null,
  }
}

export function responseOutputText(response) {
  if (typeof response?.output_text === 'string') return response.output_text
  const texts = []
  for (const item of response?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') texts.push(content.text)
    }
  }
  return texts.join('\n')
}

export function responseRefusal(response) {
  for (const item of response?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (content?.type === 'refusal' && typeof content.refusal === 'string') return content.refusal
    }
  }
  return null
}

/** Structural check only. Source membership and semantic support remain server/human checks. */
export function isTutorModelOutput(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') return false
  const keys = Object.keys(value).sort()
  const expected = ['checkQuestion', 'citations', 'example', 'explanation', 'mode']
  if (keys.length !== expected.length || !keys.every((key, index) => key === expected[index])) return false
  if (!['explanation', 'abstain'].includes(value.mode) || typeof value.explanation !== 'string' || !value.explanation.trim()) return false
  if (value.example !== null && typeof value.example !== 'string') return false
  if (value.checkQuestion !== null && typeof value.checkQuestion !== 'string') return false
  return Array.isArray(value.citations) && value.citations.length > 0 && value.citations.every((citation) =>
    citation && !Array.isArray(citation) && typeof citation === 'object' &&
    Object.keys(citation).sort().join(',') === 'quote,sourceId' &&
    typeof citation.sourceId === 'string' && Boolean(citation.sourceId.trim()) &&
    typeof citation.quote === 'string' && Boolean(citation.quote.trim()),
  )
}

export function ensureProductionRequest(request) {
  if (!request || typeof request !== 'object' || !request.body || typeof request.body !== 'object') {
    throw new Error('BENCHMARK_PROVIDER_CONTRACT: benchmark adapter did not return a request body')
  }
  if (request.body.store !== false) throw new Error('BENCHMARK_PROVIDER_CONTRACT: request must set store:false')
  if (Object.hasOwn(request.body, 'tools')) throw new Error('BENCHMARK_PROVIDER_CONTRACT: benchmark request must not include tools')
  if (!Number.isInteger(request.maxOutputTokens) || request.maxOutputTokens <= 0 || request.body.max_output_tokens !== request.maxOutputTokens) {
    throw new Error('BENCHMARK_PROVIDER_CONTRACT: adapter maxOutputTokens must be a positive exact match for body.max_output_tokens')
  }
  return request
}

export function buildRunIdentity({ model, promptHash, corpusDigest, settings }) {
  return sha256(stableJson({ model, promptHash, corpusDigest, settings }))
}

export function loadAttempts(filePath) {
  try {
    return readFileSync(filePath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
  } catch (error) {
    if (error && error.code === 'ENOENT') return []
    throw error
  }
}

export function existingAttemptKeys(attempts, runIdentity) {
  return new Set(attempts.filter((attempt) => attempt.runIdentity === runIdentity).map((attempt) => attempt.caseId))
}

export function createWorkItems(corpus, policyFixtures, split, maxCases) {
  const eligible = corpus.cases.filter((testCase) => testCase.split === split)
  const buckets = new Map()
  for (const testCase of eligible) {
    const bucket = buckets.get(testCase.chapterSlug) ?? []
    bucket.push(testCase)
    buckets.set(testCase.chapterSlug, bucket)
  }
  const chapterBuckets = [...buckets.values()].sort((left, right) =>
    left[0].chapterNumber - right[0].chapterNumber || left[0].chapterSlug.localeCompare(right[0].chapterSlug, 'en'),
  )
  const selected = []
  for (let round = 0; selected.length < maxCases; round++) {
    let added = false
    for (const bucket of chapterBuckets) {
      const testCase = bucket[round]
      if (!testCase) continue
      selected.push(testCase)
      added = true
      if (selected.length === maxCases) break
    }
    if (!added) break
  }
  const benchmarkItems = selected
    .map((benchmarkCase) => ({ id: benchmarkCase.id, kind: 'benchmark', benchmarkCase, sourceUrls: benchmarkCase.source.supplementarySources.map((source) => source.url) }))
  const policyItems = policyFixtures.map((policyFixture) => ({
    id: `policy:${policyFixture.id}`,
    kind: 'policy',
    policyFixture,
    sourceUrls: policyFixture.sourceUrls,
  }))
  return [...benchmarkItems, ...policyItems]
}

export function publicResultFromParsed(parsed, rawResponse) {
  const outputText = responseOutputText(rawResponse)
  const safeText = typeof parsed?.answer === 'string' || typeof parsed?.explanation === 'string' ? null : outputText
  return {
    answer: typeof parsed?.answer === 'string' ? parsed.answer : null,
    mode: typeof parsed?.mode === 'string' ? parsed.mode : null,
    explanation: typeof parsed?.explanation === 'string' ? parsed.explanation : null,
    example: typeof parsed?.example === 'string' || parsed?.example === null ? parsed.example : null,
    checkQuestion: typeof parsed?.checkQuestion === 'string' || parsed?.checkQuestion === null ? parsed.checkQuestion : null,
    citations: Array.isArray(parsed?.citations)
      ? parsed.citations
        .filter((citation) => typeof citation === 'string' || (citation && typeof citation === 'object' && typeof citation.sourceId === 'string' && typeof citation.quote === 'string'))
        .map((citation) => typeof citation === 'string' ? citation : { sourceId: citation.sourceId, quote: citation.quote })
      : [],
    outputText: safeText,
  }
}
