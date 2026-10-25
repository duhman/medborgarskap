import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '../content/types'
import { allChapters } from '../content/chapters/all'
import {
  displayOptions,
  formatSource,
  percentCorrect,
  pickQuestions,
  scoreQuiz,
  seededRandom,
  shuffled,
  shuffleOptionIds,
} from './quiz'

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
    for (const ch of allChapters) {
      for (const q of ch.questions) {
        counts[displayOptions(q).findIndex((o) => o.id === q.correctOptionId)] += 1
      }
    }
    const total = counts.reduce((a, b) => a + b, 0)
    for (const c of counts) expect(c / total).toBeLessThan(0.4)
  })

  it('gives the same display order on every render', () => {
    const q = allChapters[0].questions[0]
    expect(displayOptions(q)).toEqual(displayOptions(q))
  })

  it('computes percent', () => {
    expect(percentCorrect(4, 5)).toBe(80)
  })
})

describe('practice sets', () => {
  const pool = allChapters.flatMap((c) => c.questions)

  it('shuffles a list without losing or duplicating items', () => {
    const out = shuffled(pool, seededRandom('x'))
    expect(out).toHaveLength(pool.length)
    expect(new Set(out.map((q) => q.id))).toEqual(new Set(pool.map((q) => q.id)))
  })

  it('picks the requested number of distinct questions', () => {
    const picked = pickQuestions(pool, 10, seededRandom('y'))
    expect(picked).toHaveLength(10)
    expect(new Set(picked.map((q) => q.id)).size).toBe(10)
    expect(pickQuestions(pool.slice(0, 3), 10)).toHaveLength(3)
  })

  it('gives a new option order for a retry but keeps the first order stable', () => {
    const q = pool[0]
    expect(displayOptions(q).map((o) => o.id)).toEqual(displayOptions(q, '').map((o) => o.id))
    const orders = new Set(['1', '2', '3', '4', '5'].map((s) => displayOptions(q, s).map((o) => o.id).join('')))
    expect(orders.size).toBeGreaterThan(1)
  })
})
