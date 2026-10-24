import { describe, expect, it } from 'vitest'
import { chapterPageRanges, getAllChapters, getChapterBySlug, SOURCE_PDF_VERSION } from './chapters/meta'
import { officialSampleQuestions } from './officialSamples'
import { validateChapterQuestions } from './types'

describe('chapter catalog', () => {
  it('lists 13 chapters with unique slugs', () => {
    const chapters = getAllChapters()
    expect(chapters).toHaveLength(13)
    const slugs = new Set(chapters.map((c) => c.slug))
    expect(slugs.size).toBe(13)
  })

  it('fully populates all 13 chapters with at least 5 valid questions', () => {
    const chapters = getAllChapters()
    for (const ch of chapters) {
      expect(ch.isStub).toBeFalsy()
      expect(ch.questions.length).toBeGreaterThanOrEqual(5)
      expect(validateChapterQuestions(ch.questions)).toEqual([])
    }
  })

  it('cites pages that fall inside the cited chapter in Sverige i fokus', () => {
    for (const ch of getAllChapters()) {
      for (const q of ch.questions) {
        if (q.source.page == null) continue
        const [first, last] = chapterPageRanges[q.source.chapter]
        expect(q.source.page, q.id).toBeGreaterThanOrEqual(first)
        expect(q.source.page, q.id).toBeLessThanOrEqual(last)
      }
    }
  })

  it('does not reuse UHR sample question prompts as original questions', () => {
    const official = new Set(officialSampleQuestions.map((q) => q.prompt.trim().toLowerCase()))
    for (const ch of getAllChapters()) {
      for (const q of ch.questions) {
        expect(official.has(q.prompt.trim().toLowerCase()), q.id).toBe(false)
      }
    }
  })

  it('has unique question prompts', () => {
    const prompts = getAllChapters().flatMap((ch) => ch.questions.map((q) => q.prompt))
    expect(new Set(prompts).size).toBe(prompts.length)
  })

  it('marks reviewed chapters as reviewed against the current PDF version', () => {
    for (const ch of getAllChapters()) {
      if (!ch.review) continue
      expect(ch.review.pdfVersion, ch.slug).toBe(SOURCE_PDF_VERSION)
      expect(ch.review.reviewedAt, ch.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('resolves every slug through getChapterBySlug', () => {
    for (const ch of getAllChapters()) {
      const loaded = getChapterBySlug(ch.slug)
      expect(loaded?.questions.length).toBe(ch.questions.length)
      expect(loaded?.isStub).toBeFalsy()
    }
  })
})

describe('official UHR samples', () => {
  it('includes exactly 5 labeled examples', () => {
    expect(officialSampleQuestions).toHaveLength(5)
    for (const q of officialSampleQuestions) {
      expect(q.options).toHaveLength(4)
      expect(q.note.toLowerCase()).toContain('uhr')
    }
  })
})
