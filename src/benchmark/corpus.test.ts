import { describe, expect, it } from 'vitest'
import { allChapters } from '../content/chapters/all'
import { BENCHMARK_REVIEW_STATUS, benchmarkCaseId, buildBenchmarkCorpus, validateBenchmarkCorpus } from './corpus'

describe('Medborgarskap benchmark corpus', () => {
  it('derives 50 heldout learner prompts per chapter without split leakage', async () => {
    const corpus = await buildBenchmarkCorpus()
    expect(corpus.reviewStatus).toBe(BENCHMARK_REVIEW_STATUS)
    expect(corpus.questions).toHaveLength(389)
    expect(new Set(corpus.questions.map((question) => question.id)).size).toBe(389)
    expect(corpus.cases).toHaveLength(13 * 60)
    const heldout = corpus.cases.filter((testCase) => testCase.split === 'heldout')
    expect(heldout).toHaveLength(13 * 50)
    expect(new Set(heldout.map((testCase) => testCase.chapterSlug)).size).toBe(13)
    expect(new Set(heldout.map((testCase) => testCase.category))).toEqual(
      new Set(['misconception', 'easy_swedish', 'english', 'adversarial', 'source_unknown']),
    )
    expect(new Set(corpus.cases.map((testCase) => testCase.questionId)).size).toBeLessThanOrEqual(
      allChapters.flatMap((chapter) => chapter.questions).length,
    )
    await expect(validateBenchmarkCorpus(corpus)).resolves.toBeUndefined()
  })

  it('rejects a tampered evidence hash and a leaked question', async () => {
    const corpus = await buildBenchmarkCorpus()
    const tampered = structuredClone(corpus)
    tampered.cases[0].source.normalizedQuoteSha256 = 'not-a-hash'
    await expect(validateBenchmarkCorpus(tampered)).rejects.toThrow('Invalid source evidence')

    const tamperedCatalog = structuredClone(corpus)
    tamperedCatalog.questions[0].source.quote = 'Ändrat källutdrag.'
    await expect(validateBenchmarkCorpus(tamperedCatalog)).rejects.toThrow('Tampered canonical source evidence')

    const changedKey = structuredClone(corpus)
    changedKey.questions[0].correctOptionId = 'B'
    await expect(validateBenchmarkCorpus(changedKey)).rejects.toThrow('Canonical question does not match authored content')

    const leaked = structuredClone(corpus)
    const development = leaked.cases.find((testCase) => testCase.split === 'development')!
    const heldout = leaked.cases.find((testCase) => testCase.split === 'heldout')!
    heldout.questionId = development.questionId
    heldout.chapterSlug = development.chapterSlug
    heldout.chapterNumber = development.chapterNumber
    heldout.source = structuredClone(development.source)
    await expect(validateBenchmarkCorpus(leaked)).rejects.toThrow('Question leakage')

    const changedQuote = structuredClone(corpus)
    changedQuote.cases[0].source.quote = 'Ändrat källutdrag.'
    await expect(validateBenchmarkCorpus(changedQuote)).rejects.toThrow('Tampered source evidence')

    const wrongChapter = structuredClone(corpus)
    wrongChapter.cases[0].chapterNumber = 13
    await expect(validateBenchmarkCorpus(wrongChapter)).rejects.toThrow('Case provenance does not match authored content')

    const wrongBehavior = structuredClone(corpus)
    wrongBehavior.cases.find((testCase) => testCase.category === 'adversarial')!.expected = 'explain_from_evidence'
    await expect(validateBenchmarkCorpus(wrongBehavior)).rejects.toThrow('Invalid expected behavior')
  })

  it('uses logical case identities that do not depend on question order or insertion position', async () => {
    const original = await buildBenchmarkCorpus()
    const reversed = await buildBenchmarkCorpus([...allChapters].reverse())
    expect(new Set(reversed.cases.map((testCase) => testCase.id))).toEqual(new Set(original.cases.map((testCase) => testCase.id)))
    expect(benchmarkCaseId('landet-sverige', 'heldout', 'k1-q1', 'english')).toBe(
      '2026-11-01.v1:landet-sverige:heldout:k1-q1:english',
    )
    expect(benchmarkCaseId('landet-sverige', 'heldout', 'k1-q1', 'english', 1)).toBe(
      '2026-11-01.v1:landet-sverige:heldout:k1-q1:english:2',
    )
  })
})
