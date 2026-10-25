import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '../content/types'
import type { QuestionHistory } from './progress'
import { chapterNumberOfId, countDue, daysOverdue, masteryOf, pickSmartQuestions, readiness } from './review'
import { seededRandom } from './quiz'

const q = (id: string) => ({ id }) as QuizQuestion
const h = (streak: number, last: string): QuestionHistory => ({ right: streak, wrong: streak ? 0 : 1, streak, last })

describe('smart practice', () => {
  it('classifies questions by right answers in a row', () => {
    expect(masteryOf(undefined)).toBe('new')
    expect(masteryOf(h(0, '2026-10-01'))).toBe('wrong')
    expect(masteryOf(h(1, '2026-10-01'))).toBe('learning')
    expect(masteryOf(h(3, '2026-10-01'))).toBe('known')
  })

  it('brings questions back after growing intervals', () => {
    expect(daysOverdue(h(0, '2026-10-25'), '2026-10-25')).toBe(0)
    expect(daysOverdue(h(1, '2026-10-25'), '2026-10-25')).toBe(-1)
    expect(daysOverdue(h(1, '2026-10-24'), '2026-10-25')).toBe(0)
    expect(daysOverdue(h(2, '2026-10-24'), '2026-10-25')).toBe(-2)
    expect(daysOverdue(h(9, '2026-09-01'), '2026-10-25')).toBe(54 - 30)
    expect(daysOverdue(undefined, '2026-10-25')).toBeNull()
  })

  it('puts wrong and due questions first but keeps room for new ones', () => {
    const pool = Array.from({ length: 30 }, (_, i) => q(`k1-q${i}`))
    const history: Record<string, QuestionHistory> = {}
    for (let i = 0; i < 12; i++) history[`k1-q${i}`] = h(0, '2026-10-20')
    for (let i = 12; i < 20; i++) history[`k1-q${i}`] = h(3, '2026-10-24')
    const set = pickSmartQuestions(pool, history, 10, '2026-10-25', seededRandom('t'))
    const ids = set.map((x) => x.id)
    expect(new Set(ids).size).toBe(10)
    expect(ids.filter((id) => history[id]?.streak === 0)).toHaveLength(7)
    expect(ids.filter((id) => !history[id])).toHaveLength(3)
    expect(ids.filter((id) => history[id]?.streak === 3)).toHaveLength(0)
  })

  it('fills with not yet due questions when nothing else is left', () => {
    const pool = [q('k1-q1'), q('k1-q2'), q('k1-q3')]
    const history = { 'k1-q1': h(1, '2026-10-25'), 'k1-q2': h(4, '2026-10-25'), 'k1-q3': h(0, '2026-10-25') }
    const ids = pickSmartQuestions(pool, history, 2, '2026-10-25', seededRandom('t')).map((x) => x.id)
    expect(ids.sort()).toEqual(['k1-q1', 'k1-q3'])
  })

  it('counts due questions and readiness per chapter', () => {
    const history = { 'k1-q1': h(0, '2026-10-25'), 'k1-q2': h(2, '2026-10-20'), 'k2-q1': h(1, '2026-10-25'), old: h(5, '2026-10-01') }
    expect(countDue(Object.keys(history), history, '2026-10-25')).toBe(2)
    expect(readiness(history, 1, 10)).toEqual({ total: 10, known: 1, learning: 0, wrong: 1, new: 8 })
    expect(readiness(history, null, 20)).toEqual({ total: 20, known: 1, learning: 1, wrong: 1, new: 17 })
    expect(chapterNumberOfId('k12-q3')).toBe(12)
    expect(chapterNumberOfId('old')).toBeNull()
  })
})
