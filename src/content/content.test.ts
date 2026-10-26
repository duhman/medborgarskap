import { describe, expect, it } from 'vitest'
import { allChapters } from './chapters/all'
import { loadChapter, preloadRouteData } from './chapters/load'
import { chapterMetaList, chapterPageRanges, SOURCE_PDF_VERSION, totalQuestionCount } from './chapters/meta'
import { faqEntries } from './faq'
import { officialSampleQuestions } from './officialSamples'
import { validateChapterQuestions } from './types'

describe('chapter catalog', () => {
  it('lists 13 chapters with unique slugs', () => {
    const chapters = chapterMetaList
    expect(chapters).toHaveLength(13)
    const slugs = new Set(chapters.map((c) => c.slug))
    expect(slugs.size).toBe(13)
  })

  it('fully populates all 13 chapters with at least 5 valid questions', () => {
    const chapters = allChapters
    for (const ch of chapters) {
      expect(ch.questions.length).toBeGreaterThanOrEqual(5)
      expect(validateChapterQuestions(ch.questions)).toEqual([])
    }
  })

  it('cites pages that fall inside the cited chapter in Sverige i fokus', () => {
    for (const ch of allChapters) {
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
    for (const ch of allChapters) {
      for (const q of ch.questions) {
        expect(official.has(q.prompt.trim().toLowerCase()), q.id).toBe(false)
      }
    }
  })

  it('has unique question prompts', () => {
    const prompts = allChapters.flatMap((ch) => ch.questions.map((q) => q.prompt))
    expect(new Set(prompts).size).toBe(prompts.length)
  })

  it('marks reviewed chapters as reviewed against the current PDF version', () => {
    for (const ch of allChapters) {
      if (!ch.review) continue
      expect(ch.review.pdfVersion, ch.slug).toBe(SOURCE_PDF_VERSION)
      expect(ch.review.reviewedAt, ch.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('gives every chapter a review, an easy-Swedish summary and a glossary', () => {
    for (const ch of allChapters) {
      expect(ch.review, ch.slug).toBeTruthy()
      expect(ch.summaryEasy?.length ?? 0, ch.slug).toBeGreaterThanOrEqual(3)
      expect(ch.glossary?.length ?? 0, ch.slug).toBeGreaterThanOrEqual(8)
    }
  })

  it('gives every question a quote from the material and an English explanation', () => {
    for (const ch of allChapters) {
      for (const q of ch.questions) {
        const quote = q.source.quote ?? ''
        expect(quote.length, `${q.id} quote`).toBeGreaterThanOrEqual(30)
        expect(quote.length, `${q.id} quote`).toBeLessThanOrEqual(200)
        expect(q.explanationEn?.trim(), `${q.id} explanationEn`).toBeTruthy()
      }
    }
  })

  it('has no en or em dashes in chapter text', () => {
    const dash = /[–—]/
    for (const ch of allChapters) {
      const strings = [
        ch.intro,
        ...(ch.bullets ?? []),
        ...(ch.summaryEasy ?? []),
        ...(ch.glossary ?? []).flatMap((g) => [g.term, g.sv, g.en]),
        ...ch.questions.flatMap((q) => [
          q.prompt,
          q.explanationSv,
          q.explanationEn ?? '',
          q.source.quote ?? '',
          ...q.options.map((o) => o.text),
        ]),
      ]
      for (const s of strings) expect(dash.test(s), s).toBe(false)
    }
  })

  // Om rätt svar ofta är det längsta alternativet kan man gissa rätt utan att kunna stoffet.
  it('rarely makes the correct option clearly the longest', () => {
    for (const ch of allChapters) {
      const flagged = ch.questions.filter((q) => {
        const correct = q.options.find((o) => o.id === q.correctOptionId)!.text.length
        const others = q.options.filter((o) => o.id !== q.correctOptionId).map((o) => o.text.length)
        return correct > Math.max(...others) * 1.15
      })
      expect(flagged.length, `${ch.slug}: ${flagged.map((q) => q.id).join(', ')}`).toBeLessThanOrEqual(
        Math.floor(ch.questions.length / 15),
      )
    }
  })

  it('keeps the chapter list in sync with the chapters, in book order', () => {
    expect(allChapters.map((c) => c.slug)).toEqual(chapterMetaList.map((c) => c.slug))
    for (const [i, meta] of chapterMetaList.entries()) {
      const ch = allChapters[i]
      expect({ number: meta.number, title: meta.title, intro: meta.intro, mp3Url: meta.mp3Url }, ch.slug).toEqual({
        number: ch.number,
        title: ch.title,
        intro: ch.intro,
        mp3Url: ch.mp3Url,
      })
      expect(meta.questionCount, ch.slug).toBe(ch.questions.length)
    }
    expect(totalQuestionCount).toBe(allChapters.reduce((n, c) => n + c.questions.length, 0))
  })

  it('loads every chapter on demand by its slug', async () => {
    for (const ch of allChapters) {
      expect(await loadChapter(ch.slug)).toBe(ch)
    }
    await expect(loadChapter('finns-inte')).rejects.toThrow()
    await expect(preloadRouteData('/kapitel/finns-inte')).resolves.toBeUndefined()
  })
})

describe('official UHR samples', () => {
  it('includes exactly 5 labeled examples', () => {
    expect(officialSampleQuestions).toHaveLength(5)
    for (const q of officialSampleQuestions) {
      expect(q.options).toHaveLength(4)
    }
  })
})

describe('FAQ', () => {
  it('has unique ids, an answer and a dated official source for every entry, and no long dashes', () => {
    expect(new Set(faqEntries.map((f) => f.id)).size).toBe(faqEntries.length)
    for (const f of faqEntries) {
      expect(f.answer.length, f.id).toBeGreaterThan(0)
      expect(f.sources.length, f.id).toBeGreaterThan(0)
      for (const s of f.sources) expect(s.checkedAt, f.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      for (const text of [f.question, ...f.answer]) expect(/[\u2013\u2014]/.test(text), text).toBe(false)
    }
  })
})
