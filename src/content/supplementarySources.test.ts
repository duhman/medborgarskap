import { describe, expect, it } from 'vitest'
import { allChapters } from './chapters/all'
import { validateQuestion } from './types'

const byId = new Map(allChapters.flatMap((chapter) => chapter.questions).map((question) => [question.id, question]))

describe('supplementary official sources', () => {
  it('keeps current-rule qualifications separate from the Sverige i fokus evidence', () => {
    for (const id of ['k4-q9', 'k5-q5', 'k8-q21']) {
      const question = byId.get(id)
      expect(question, id).toBeDefined()
      expect(question!.source.quote, id).toBeTruthy()
      expect(question!.source.supplementarySources, id).toHaveLength(1)
      expect(validateQuestion(question!), id).toEqual([])
    }
  })

  it('does not turn the historical PDF wording into a guarantee of asylum', () => {
    const question = byId.get('k7-q10')!
    expect(question.options.find((option) => option.id === question.correctOptionId)?.text).toBe('Att söka asyl i ett annat land')
    expect(question.explanationSv).toContain('söka och åtnjuta asyl')
    expect(question.source.quote).toContain('söka asyl')
    expect(question.source.supplementarySources).toBeUndefined()
  })

  it('keeps the IAF transition between the income rule and older benefit periods', () => {
    const question = byId.get('k8-q21')!
    expect(question.explanationSv).toContain('För beslut från och med den 1 oktober 2025')
    expect(question.explanationSv).toContain('ersättningsperioder som började före datumet')
    expect(question.source.supplementarySources?.[0].quote).toContain('tidigare regelverket')
  })
})
