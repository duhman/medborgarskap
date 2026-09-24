import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '../content/types'
import { formatSource, percentCorrect, scoreQuiz } from './quiz'

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

  it('computes percent', () => {
    expect(percentCorrect(4, 5)).toBe(80)
  })
})
