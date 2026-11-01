#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const output = resolve(root, 'benchmark/medborgarskap-v1.jsonl')
const sourceOutput = resolve(root, 'benchmark/medborgarskap-v1.sources.json')
const policyOutput = resolve(root, 'benchmark/medborgarskap-policy-v1.json')
const manifestOutput = resolve(root, 'benchmark/medborgarskap-v1.manifest.json')
const checkOnly = process.argv.includes('--check')

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

const server = await createServer({ root, server: { middlewareMode: true } })
try {
  const { buildBenchmarkCorpus } = await server.ssrLoadModule('/src/benchmark/corpus.ts')
  const { POLICY_FIXTURE_VERSION, POLICY_REVIEW_STATUS, policyFixtures, validatePolicyFixtures } = await server.ssrLoadModule('/src/benchmark/policy.ts')
  const corpus = await buildBenchmarkCorpus()
  validatePolicyFixtures(policyFixtures)
  const jsonl = corpus.cases.map((testCase) => JSON.stringify(testCase)).join('\n') + '\n'
  const sources = JSON.stringify(corpus.questions, null, 2) + '\n'
  const policy = JSON.stringify(
    { version: POLICY_FIXTURE_VERSION, reviewStatus: POLICY_REVIEW_STATUS, fixtureCount: policyFixtures.length, fixtures: policyFixtures },
    null,
    2,
  ) + '\n'
  const manifest = JSON.stringify(
    {
      version: corpus.version,
      generatedFrom: corpus.generatedFrom,
      reviewStatus: corpus.reviewStatus,
      generatedCaseCount: corpus.cases.length,
      canonicalQuestionCount: corpus.questions.length,
      heldoutCaseCount: corpus.cases.filter((testCase) => testCase.split === 'heldout').length,
      corpusSha256: sha256(jsonl),
      sourcesSha256: sha256(sources),
      policyFixtureCount: policyFixtures.length,
      policySha256: sha256(policy),
      artifact: 'medborgarskap-v1.jsonl',
      canonicalSourcesArtifact: 'medborgarskap-v1.sources.json',
      policyArtifact: 'medborgarskap-policy-v1.json',
    },
    null,
    2,
  ) + '\n'
  if (checkOnly) {
    const current = readFileSync(output, 'utf8')
    const currentSources = readFileSync(sourceOutput, 'utf8')
    const currentPolicy = readFileSync(policyOutput, 'utf8')
    const currentManifest = readFileSync(manifestOutput, 'utf8')
    if (current !== jsonl || currentSources !== sources || currentPolicy !== policy || currentManifest !== manifest) {
      throw new Error('BENCHMARK_ARTIFACT_STALE: run node scripts/benchmark/generate.mjs')
    }
    console.log(`Benchmark corpus is current (${corpus.cases.length} cases).`)
  } else {
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, jsonl)
    writeFileSync(sourceOutput, sources)
    writeFileSync(policyOutput, policy)
    writeFileSync(manifestOutput, manifest)
    console.log(`Wrote ${corpus.cases.length} cases to ${output}`)
  }
} finally {
  await server.close()
}
