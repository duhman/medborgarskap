import { describe, expect, it } from 'vitest'
import { getAllChapters, getChapterBySlug } from './chapters/meta'
import { officialSampleQuestions } from './officialSamples'
import { validateChapterQuestions } from './types'

describe('chapter catalog', () => {
  it('lists 13 chapters with unique slugs', () => {
    const chapters = getAllChapters()
    expect(chapters).toHaveLength(13)
    const slugs = new Set(chapters.map((c) => c.slug))
    expect(slugs.size).toBe(13)
  })

  it('fully populates first three chapters with at least 5 questions', () => {
    for (const slug of [
      'landet-sverige',
      'sveriges-demokratiska-system',
      'sa-har-styrs-sverige',
    ]) {
      const ch = getChapterBySlug(slug)
      expect(ch).toBeDefined()
      expect(ch!.isStub).toBeFalsy()
      expect(ch!.questions.length).toBeGreaterThanOrEqual(5)
      expect(validateChapterQuestions(ch!.questions)).toEqual([])
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
