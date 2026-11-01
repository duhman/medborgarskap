#!/usr/bin/env node
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import {
  DEFAULT_TIMEOUT_MS,
  buildRunIdentity,
  createWorkItems,
  ensureProductionRequest,
  estimateCostUsd,
  estimateInputTokens,
  existingAttemptKeys,
  isTutorModelOutput,
  loadAttempts,
  parseArgs,
  publicResultFromParsed,
  redactError,
  redactSensitiveText,
  responseOutputText,
  responseRefusal,
  sha256,
  stableJson,
  usageFromResponse,
} from './support.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const endpoint = 'https://api.openai.com/v1/responses'
const apiKeyEnvironmentName = ['OPENAI', 'API', 'KEY'].join('_')

function defaultOutputDirectory() {
  return resolve('/tmp', `medborgarskap-model-benchmark-${new Date().toISOString().replace(/[:.]/g, '-')}`)
}

function requireApiKey(environment) {
  const credential = environment[apiKeyEnvironmentName]
  if (!credential) throw new Error('BENCHMARK_CONFIGURATION: an OpenAI API key is required for --live; load the ignored local environment file with node --env-file=.env.local')
  return credential
}

function corpusDigest(corpus, policyFixtures) {
  return sha256(stableJson({ corpusVersion: corpus.version, corpusReviewStatus: corpus.reviewStatus, questions: corpus.questions, cases: corpus.cases, policyFixtures }))
}

function providerFailure(status) {
  if (status === 429) return 'rate_or_quota'
  if (status === 402) return 'insufficient_credits'
  if (status >= 500) return 'provider_server_error'
  return 'provider_http_error'
}

function publicCaseMetadata(item, sourceUrls = item.sourceUrls) {
  if (item.kind === 'policy') return {
    kind: item.kind,
    caseId: item.id,
    inputProvenance: 'policy-fixture-public-official-urls',
    expected: item.policyFixture.expected,
    sourceUrls,
    policyRequiredAssertions: item.policyFixture.requiredAssertions,
    policyForbiddenAssertions: item.policyFixture.forbiddenAssertions,
    humanSemanticReview: item.policyFixture.humanSemanticReview,
  }
  return {
    kind: item.kind,
    caseId: item.id,
    questionId: item.benchmarkCase.questionId,
    inputProvenance: 'canonical-public-benchmark',
    expected: item.benchmarkCase.expected,
    sourceUrls,
    chapterSlug: item.benchmarkCase.chapterSlug,
    chapterNumber: item.benchmarkCase.chapterNumber,
    category: item.benchmarkCase.category,
    humanSemanticReview: item.benchmarkCase.humanSemanticReview,
  }
}

function publicValidation(item, adapterValidation) {
  return {
    format: adapterValidation?.format ?? 'valid',
    expectedBehavior: item.kind === 'policy' ? item.policyFixture.expected : item.benchmarkCase.expected,
    semanticAssessment: 'human_review_required',
    corpusHumanSemanticReview: item.kind === 'policy' ? item.policyFixture.humanSemanticReview : item.benchmarkCase.humanSemanticReview,
  }
}

function writeImmutableJson(filePath, value) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`
  if (existsSync(filePath)) {
    if (readFileSync(filePath, 'utf8') !== serialized) throw new Error(`BENCHMARK_IMMUTABLE_LOG: ${filePath} already exists with different metadata`)
    return
  }
  writeFileSync(filePath, serialized)
}

function loadBenchmarkAdapter(module) {
  if (typeof module.buildTutorBenchmarkRequest !== 'function') throw new Error('BENCHMARK_PROVIDER_CONTRACT: src/server/tutor.ts must export buildTutorBenchmarkRequest')
  if (typeof module.promptVersion !== 'string' || !module.promptVersion) throw new Error('BENCHMARK_PROVIDER_CONTRACT: src/server/tutor.ts must export a non-empty promptVersion')
  return {
    buildRequest: module.buildTutorBenchmarkRequest,
    promptVersion: module.promptVersion,
    parseResponse: typeof module.parseTutorBenchmarkResponse === 'function' ? module.parseTutorBenchmarkResponse : null,
    validateResponse: typeof module.validateTutorBenchmarkResponse === 'function' ? module.validateTutorBenchmarkResponse : null,
  }
}

async function loadInputs() {
  const server = await createServer({ root, server: { middlewareMode: true } })
  try {
    const corpusModule = await server.ssrLoadModule('/src/benchmark/corpus.ts')
    const policyModule = await server.ssrLoadModule('/src/benchmark/policy.ts')
    const tutorModule = await server.ssrLoadModule('/src/server/tutor.ts')
    const corpus = await corpusModule.buildBenchmarkCorpus()
    policyModule.validatePolicyFixtures(policyModule.policyFixtures)
    return { corpus, policyFixtures: policyModule.policyFixtures, adapter: loadBenchmarkAdapter(tutorModule) }
  } finally {
    await server.close()
  }
}

async function withConcurrency(items, limit, execute) {
  const results = new Array(items.length)
  let cursor = 0
  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await execute(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

/** Runs already-loaded public benchmark work. Failed calls are recorded once and never retried. */
export async function runBenchmark({ options, corpus, policyFixtures, adapter, fetchImpl = fetch, environment = process.env, outputDirectory }) {
  const selectedItems = createWorkItems(corpus, policyFixtures, options.split, options.maxCases)
  const preparedItems = await Promise.all(selectedItems.map(async (item) => ({
    ...item,
    prepared: ensureProductionRequest(await adapter.buildRequest({ model: options.model, benchmarkCase: item.benchmarkCase, policyFixture: item.policyFixture })),
  })))
  const digest = corpusDigest(corpus, policyFixtures)
  const promptHash = sha256(stableJson(preparedItems.map(({ id, prepared }) => ({
    id, endpoint: prepared.endpoint ?? endpoint, maxOutputTokens: prepared.maxOutputTokens, body: prepared.body,
  }))))
  const requestBodyFingerprints = new Map(preparedItems.map((item) => [item.id, sha256(stableJson(item.prepared.body))]))
  const settings = {
    runnerVersion: '2026-11-01.v1', split: options.split, maxCases: options.maxCases,
    maxConcurrency: options.maxConcurrency, timeoutMs: options.timeoutMs,
    requestFingerprint: promptHash,
    pricing: options.live ? { budgetUsd: options.budgetUsd, inputUsdPerMillion: options.inputUsdPerMillion, outputUsdPerMillion: options.outputUsdPerMillion } : null,
  }
  const runIdentity = buildRunIdentity({ model: options.model, promptHash, corpusDigest: digest, settings })
  const plan = {
    runnerVersion: '2026-11-01.v1', runIdentity, model: options.model, split: options.split,
    corpusDigest: digest, promptHash, requestFingerprint: promptHash, promptVersion: adapter.promptVersion, settings,
    selectedCaseIds: preparedItems.map((item) => item.id),
    selectedBenchmarkCases: selectedItems.filter((item) => item.kind === 'benchmark').length,
    selectedPolicyFixtures: selectedItems.filter((item) => item.kind === 'policy').length,
    heldoutInterpretation: options.split === 'heldout' ? 'Heldout output is a candidate comparison artifact, not proof of blindness or production quality.' : null,
    billingNotice: 'Cost estimates are runner-side token estimates. OpenAI account billing is separate.',
  }
  if (!options.live) return { plan: { ...plan, requestContractCases: preparedItems.length }, dryRun: true, attempts: [], requestBodyFingerprints }

  const credential = requireApiKey(environment)
  const out = outputDirectory ?? options.output ?? defaultOutputDirectory()
  const attemptsPath = resolve(out, 'attempts.jsonl')
  const reservationsPath = resolve(out, 'reservations.jsonl')
  const manifestPath = resolve(out, 'run.json')
  mkdirSync(out, { recursive: true })
  writeImmutableJson(manifestPath, plan)
  const priorAttempts = loadAttempts(attemptsPath)
  const priorReservations = loadAttempts(reservationsPath)
  if ((priorAttempts.length || priorReservations.length) && !options.resume) throw new Error('BENCHMARK_RESUME_REQUIRED: output already has reservations or attempts; use --resume only for identical run metadata')
  const completedKeys = options.resume ? existingAttemptKeys(priorAttempts, runIdentity) : new Set()
  const reservedKeys = options.resume ? existingAttemptKeys(priorReservations, runIdentity) : new Set()
  const candidates = preparedItems.filter((item) => !completedKeys.has(item.id) && !reservedKeys.has(item.id))
  let reservedUsd = priorReservations
    .filter((reservation) => reservation.runIdentity === runIdentity)
    .reduce((total, reservation) => total + (Number.isFinite(reservation.reservationUsd) ? reservation.reservationUsd : 0), 0)
  let reservationQueue = Promise.resolve()
  const reserveForCall = async (item) => {
    let release
    const previous = reservationQueue
    reservationQueue = new Promise((resolve) => { release = resolve })
    await previous
    try {
      const { prepared } = item
      const inputTokens = estimateInputTokens(prepared.body)
      const reservationUsd = estimateCostUsd({ inputTokens, outputTokens: prepared.maxOutputTokens, inputUsdPerMillion: options.inputUsdPerMillion, outputUsdPerMillion: options.outputUsdPerMillion })
      if (reservedUsd + reservationUsd > options.budgetUsd) throw new Error(`BENCHMARK_BUDGET: reserving case ${item.id} would exceed --budget-usd; no further calls were made`)
      reservedUsd += reservationUsd
      appendFileSync(reservationsPath, `${JSON.stringify({
        schemaVersion: 1, event: 'reservation', runIdentity, reservedAt: new Date().toISOString(), model: options.model,
        promptHash, corpusDigest: digest, settingsHash: sha256(stableJson(settings)), ...publicCaseMetadata(item, prepared.sourceUrls), reservationUsd,
      })}\n`)
      return { prepared, inputTokens, reservationUsd }
    } finally {
      release()
    }
  }

  const attempts = await withConcurrency(candidates, options.maxConcurrency, async (item, index) => {
    const { prepared, inputTokens, reservationUsd } = await reserveForCall(item)
    let headersLatencyMs = null
    const started = performance.now()
    const finish = (attempt) => {
      const completed = { ...attempt, latencyMs: Math.round(performance.now() - started), headersLatencyMs }
      appendFileSync(attemptsPath, `${JSON.stringify(completed)}\n`)
      return completed
    }
    const base = {
      schemaVersion: 1, runIdentity, attempt: priorAttempts.length + index + 1, startedAt: new Date().toISOString(),
      model: options.model, promptHash, requestFingerprint: promptHash, requestBodyFingerprint: sha256(stableJson(prepared.body)), promptVersion: adapter.promptVersion, corpusDigest: digest,
      benchmarkCorpusDigest: digest,
      settingsHash: sha256(stableJson(settings)), ...publicCaseMetadata(item, prepared.sourceUrls), inputTokenEstimate: inputTokens,
      learnerPrompt: item.kind === 'benchmark' ? item.benchmarkCase.prompt : item.policyFixture.prompt,
      reservationUsd, billing: 'estimated_only_not_account_billed', validation: null, outputFingerprint: null, reviewEvidence: prepared.reviewContext ?? null,
    }
    try {
      const response = await fetchImpl(prepared.endpoint ?? endpoint, {
        method: 'POST',
        headers: { authorization: `Bearer ${credential}`, 'content-type': 'application/json' },
        body: JSON.stringify(prepared.body),
        signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      })
      headersLatencyMs = Math.round(performance.now() - started)
      const latencyMs = headersLatencyMs
      if (!response.ok) return finish({ ...base, latencyMs, usage: null, chargedTokenEstimateUsd: null, outcome: 'failed', acceptedAnswer: false, refusal: null, timeout: false, failureCategory: providerFailure(response.status), httpStatus: response.status, error: `provider returned HTTP ${response.status}` })
      let rawResponse
      try { rawResponse = await response.json() } catch {
        return finish({ ...base, latencyMs, usage: null, chargedTokenEstimateUsd: null, outcome: 'failed', acceptedAnswer: false, refusal: null, timeout: false, failureCategory: 'malformed_provider_response', httpStatus: response.status, error: 'provider returned malformed JSON' })
      }
      const usage = usageFromResponse(rawResponse)
      const chargedTokenEstimateUsd = usage ? estimateCostUsd({ ...usage, inputUsdPerMillion: options.inputUsdPerMillion, outputUsdPerMillion: options.outputUsdPerMillion }) : null
      const refusal = responseRefusal(rawResponse)
      if (refusal) return finish({ ...base, latencyMs, usage, chargedTokenEstimateUsd, outcome: 'refusal', acceptedAnswer: false, refusal, timeout: false, failureCategory: null, validation: publicValidation(item, null), response: null })
      if (rawResponse?.status && rawResponse.status !== 'completed') return finish({ ...base, latencyMs, usage, chargedTokenEstimateUsd, outcome: 'failed', acceptedAnswer: false, refusal: null, timeout: false, failureCategory: 'provider_incomplete_response', error: `provider response status ${rawResponse.status}` })
      try {
        const parsed = adapter.parseResponse ? await adapter.parseResponse(rawResponse) : JSON.parse(responseOutputText(rawResponse))
        if (!isTutorModelOutput(parsed)) throw new Error('adapter rejected structured output')
        const adapterValidation = adapter.validateResponse ? await adapter.validateResponse(parsed, { benchmarkCase: item.benchmarkCase, policyFixture: item.policyFixture }) : null
        const outputText = responseOutputText(rawResponse)
        return finish({ ...base, latencyMs, usage, chargedTokenEstimateUsd, outcome: 'completed', acceptedAnswer: true, refusal: null, timeout: false, failureCategory: null, validation: publicValidation(item, adapterValidation), outputText, outputFingerprint: item.kind === 'benchmark' ? sha256(outputText) : null, response: publicResultFromParsed(parsed, rawResponse) })
      } catch (error) {
        const rawOutputText = responseOutputText(rawResponse)
        const boundedOutputText = rawOutputText ? redactSensitiveText(rawOutputText).slice(0, 16 * 1024) : null
        return finish({ ...base, latencyMs, usage, chargedTokenEstimateUsd, outcome: 'failed', acceptedAnswer: false, refusal: null, timeout: false, failureCategory: 'invalid_structured_output', error: redactError(error), outputText: boundedOutputText, outputTextTruncated: Boolean(rawOutputText && rawOutputText.length > 16 * 1024), outputFingerprint: rawOutputText ? sha256(rawOutputText) : null })
      }
    } catch (error) {
      const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError'
      return finish({ ...base, latencyMs: Math.round(performance.now() - started), usage: null, chargedTokenEstimateUsd: null, outcome: 'failed', acceptedAnswer: false, refusal: null, timeout, failureCategory: timeout ? 'timeout' : 'request_error', error: redactError(error) })
    }
  })
  return { plan, dryRun: false, outputDirectory: out, attempts, priorAttempts, reservedUsd, requestBodyFingerprints }
}

/** Reconstructs a historical learner prompt only with matching corpus and prepared-body fingerprints. */
export function prepareReviewAttempts(attempts, { corpus, policyFixtures, currentCorpusDigest, historicalCorpusDigest, requestBodyFingerprints }) {
  const promptByCaseId = new Map([
    ...corpus.cases.map((testCase) => [testCase.id, testCase.prompt]),
    ...policyFixtures.map((fixture) => [`policy:${fixture.id}`, fixture.prompt]),
  ])
  const mayReconstruct = typeof historicalCorpusDigest === 'string' && historicalCorpusDigest === currentCorpusDigest
  return attempts.map((attempt) => {
    if (typeof attempt.learnerPrompt === 'string') return attempt
    const sameRequestBody = typeof attempt.requestBodyFingerprint === 'string' && requestBodyFingerprints?.get(attempt.caseId) === attempt.requestBodyFingerprint
    const prompt = mayReconstruct && sameRequestBody ? promptByCaseId.get(attempt.caseId) : undefined
    if (prompt) return { ...attempt, learnerPrompt: prompt, learnerPromptStatus: 'reconstructed_from_matching_corpus' }
    return {
      ...attempt,
      learnerPrompt: null,
      learnerPromptUnavailable: mayReconstruct
        ? sameRequestBody
          ? 'Unavailable: case is absent from the matching current corpus.'
          : 'Unavailable: historical request-body fingerprint does not match the current prepared case.'
        : 'Unavailable: historical corpus digest does not match the current recomputed corpus.',
    }
  })
}

function recoverReviewOutputFields(attempt) {
  if (attempt.response && Object.hasOwn(attempt.response, 'mode') && Object.hasOwn(attempt.response, 'example') && Object.hasOwn(attempt.response, 'checkQuestion')) return attempt
  if (attempt.acceptedAnswer !== true) return { ...attempt, generatedFieldsUnavailable: 'Unavailable: model output was not accepted.' }
  if (typeof attempt.outputText !== 'string') return { ...attempt, generatedFieldsUnavailable: 'Unavailable: accepted output text was not recorded.' }
  if (typeof attempt.outputFingerprint === 'string' && sha256(attempt.outputText) !== attempt.outputFingerprint) {
    return { ...attempt, generatedFieldsUnavailable: 'Unavailable: accepted output text fingerprint does not match.' }
  }
  try {
    const parsed = JSON.parse(attempt.outputText)
    if (!isTutorModelOutput(parsed)) throw new Error('not a tutor output')
    return {
      ...attempt,
      response: {
        ...(attempt.response ?? {}),
        mode: parsed.mode,
        explanation: attempt.response?.explanation ?? parsed.explanation,
        example: parsed.example,
        checkQuestion: parsed.checkQuestion,
        citations: attempt.response?.citations ?? parsed.citations,
      },
      generatedFieldsStatus: typeof attempt.outputFingerprint === 'string' ? 'recovered_from_verified_output_text' : 'recovered_from_unhashed_output_text',
    }
  } catch {
    return { ...attempt, generatedFieldsUnavailable: 'Unavailable: accepted output text is not valid tutor JSON.' }
  }
}

export function buildReviewPacket(attempts, { candidateLabel = 'Candidate A', generatedAt = 'pending-human-review' } = {}) {
  const lines = [
    '# Medborgarskap tutor benchmark - human review packet', '',
    `Candidate label: ${candidateLabel} (model identity withheld from reviewers)`, `Generated: ${generatedAt}`, '',
    'This packet is for two independent reviewers. It contains model output, not a semantic approval. The corpus and policy fixtures remain human-semantic-review pending.', '',
    'For each response, record whether the answer is factually supported by the supplied sources and useful to a learner. Leave a field blank when the response failed, timed out or refused.', '',
  ]
  for (const attempt of attempts.map(recoverReviewOutputFields)) {
    const evidence = attempt.reviewEvidence
    const options = Array.isArray(evidence?.options) ? evidence.options.map((option) => `${option.id}: ${option.text}`).join(' | ') : null
    const evidenceLines = Array.isArray(evidence?.sources)
      ? evidence.sources.map((source) => `- Approved evidence: ${source.authority ?? 'Unknown authority'}; checked ${source.checkedAt ?? 'not separately dated'}; <${source.url}>\n  > ${source.quote ?? 'No captured quote'}`)
      : ['- Approved evidence: No captured quote context was recorded.']
    lines.push(
      `## ${attempt.caseId}`, '', `- Candidate: ${candidateLabel}`, `- Outcome: ${attempt.outcome}`,
      `- Accepted answer: ${attempt.acceptedAnswer === true ? 'Yes' : 'No - do not score as an accepted answer'}`,
      `- Expected handling: ${attempt.expected}`, `- Source citations: ${(attempt.sourceUrls ?? []).map((url) => `<${url}>`).join(', ') || 'None recorded'}`,
      `- Model citations: ${(attempt.response?.citations ?? []).map((citation) => typeof citation === 'string' ? citation : `[${citation.sourceId}] ${citation.quote}`).join('; ') || 'No accepted model citations'}`,
      ...(evidence?.questionPrompt ? [`- Question: ${evidence.questionPrompt}`, `- Options: ${options ?? 'Not recorded'}`, `- Selected option: ${evidence.selectedOptionId ?? 'None'}`, `- Correct option: ${evidence.correctOptionId ?? 'Not recorded'}`] : []),
      `- Learner prompt: ${attempt.learnerPrompt ?? attempt.learnerPromptUnavailable ?? evidence?.prompt ?? 'Unavailable: no recorded learner prompt.'}`,
      ...(evidence?.limitation ? [`- Evidence limitation: ${evidence.limitation}`] : []),
      ...evidenceLines,
      `- Mode: ${attempt.response?.mode ?? attempt.generatedFieldsUnavailable ?? 'Unavailable: no generated mode was recorded.'}`,
      `- Answer: ${attempt.response?.answer ?? 'No accepted answer'}`,
      `- Explanation: ${attempt.response?.explanation ?? attempt.response?.outputText ?? attempt.outputText ?? 'No accepted explanation'}`, '',
      `- Example: ${attempt.response && Object.hasOwn(attempt.response, 'example') ? attempt.response.example ?? 'None supplied' : attempt.generatedFieldsUnavailable ?? 'Unavailable: no generated example was recorded.'}`,
      `- Check question: ${attempt.response && Object.hasOwn(attempt.response, 'checkQuestion') ? attempt.response.checkQuestion ?? 'None supplied' : attempt.generatedFieldsUnavailable ?? 'Unavailable: no generated check question was recorded.'}`, '',
      '| Reviewer | Factually supported by cited source? | Useful to learner? | Notes |',
      '| --- | --- | --- | --- |', '| Reviewer 1 |  |  |  |', '| Reviewer 2 |  |  |  |', '',
    )
  }
  lines.push('## Release gate', '', 'Do not make a production-quality claim from this packet. The future heldout gate is at least 500 reviewed cases, with two independent reviews and discrepancies resolved.')
  return `${lines.join('\n')}\n`
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.resume && !options.output) throw new Error('BENCHMARK_ARGUMENT: --resume requires --out')
  if (options.exportReviewPacket && !options.output) throw new Error('BENCHMARK_ARGUMENT: --export-review-packet requires --out')
  const { corpus, policyFixtures, adapter } = await loadInputs()
  const result = await runBenchmark({ options, corpus, policyFixtures, adapter })
  if (options.exportReviewPacket) {
    const attempts = loadAttempts(resolve(options.output, 'attempts.jsonl'))
    let historicalCorpusDigest = null
    try { historicalCorpusDigest = JSON.parse(readFileSync(resolve(options.output, 'run.json'), 'utf8')).corpusDigest } catch { /* packet marks unmatched historical prompts unavailable */ }
    const reviewAttempts = prepareReviewAttempts(attempts, { corpus, policyFixtures, currentCorpusDigest: result.plan.corpusDigest, historicalCorpusDigest, requestBodyFingerprints: result.requestBodyFingerprints })
    writeFileSync(resolve(options.exportReviewPacket), buildReviewPacket(reviewAttempts))
    console.log(`Wrote blind human-review packet to ${options.exportReviewPacket}`)
  }
  if (result.dryRun) {
    console.log(`Dry run: ${result.plan.selectedBenchmarkCases} ${options.split} cases + ${result.plan.selectedPolicyFixtures} policy fixtures for ${options.model}. Pass --live, an explicit budget and current input/output rates to call the provider.`)
  } else {
    console.log(`Recorded ${result.attempts.length} raw attempts in ${result.outputDirectory}; reserved estimate $${result.reservedUsd.toFixed(6)}. Account billing remains separate.`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(redactError(error))
    process.exitCode = 1
  })
}
