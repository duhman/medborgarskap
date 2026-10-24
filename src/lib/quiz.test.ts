import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '../content/types'
import { getAllChapters } from '../content/chapters/meta'
import { displayOptions, formatSource, percentCorrect, scoreQuiz, shuffleOptionIds } from './quiz'

const sample: QuizQuestion[] = [
  {
    id: 't1',
    prompt: 'Test?',
    options: [
      { id: 'A', text: 'a' },
      { id: 'B', text: 'b' },
      { id: 'C', text: 'c' },
      { id: 'D', text: 'd' },
    ],
    correctOptionId: 'B',
    explanationSv: 'Förklaring',
    source: { chapter: 1, page: 2 },
  },
]

describe('scoreQuiz', () => {
  it('counts correct answers', () => {
    expect(scoreQuiz(sample, { t1: 'B' })).toEqual({ score: 1, total: 1 })
    expect(scoreQuiz(sample, { t1: 'A' })).toEqual({ score: 0, total: 1 })
  })
})

describe('helpers', () => {
  it('formats source with page', () => {
    expect(formatSource({ chapter: 3, page: 5 })).toContain('Kapitel 3')
    expect(formatSource({ chapter: 3, page: 5 })).toContain('sida 5')
  })

  it('shuffles option ids without losing any', () => {
    const ids = ['A', 'B', 'C', 'D'] as const
    const shuffled = shuffleOptionIds([...ids], () => 0)
    expect(shuffled).not.toEqual(ids)
    expect([...shuffled].sort()).toEqual([...ids])
  })

  it('spreads correct answers over all four display positions', () => {
    const counts = [0, 0, 0, 0]
    for (const ch of getAllChapters()) {
      for (const q of ch.questions) {
        counts[displayOptions(q).findIndex((o) => o.id === q.correctOptionId)] += 1
      }
    }
    const total = counts.reduce((a, b) => a + b, 0)
    for (const c of counts) expect(c / total).toBeLessThan(0.4)
  })

  it('gives the same display order on every render', () => {
    const q = getAllChapters()[0].questions[0]
    expect(displayOptions(q)).toEqual(displayOptions(q))
  })

  it('computes percent', () => {
    expect(percentCorrect(4, 5)).toBe(80)
  })
})
