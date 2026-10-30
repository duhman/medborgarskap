import { beforeEach, describe, expect, it } from 'vitest'
import type { QuizQuestion } from '../content/types'
import { seededRandom } from './quiz'
import {
  addExamResult,
  clearExamSession,
  examMinutes,
  formatTimeLeft,
  getExamHistory,
  getExamSessionRaw,
  msLeft,
  parseExamSession,
  pickExamQuestions,
  saveExamSession,
  scoreExam,
  subscribeExam,
} from './exam'

const q = (chapter: number, n: number): QuizQuestion => ({
  id: `k${chapter}-q${n}`,
  prompt: `Fråga ${chapter}-${n}`,
  options: [
    { id: 'A', text: 'a' },
    { id: 'B', text: 'b' },
    { id: 'C', text: 'c' },
    { id: 'D', text: 'd' },
  ],
  correctOptionId: 'A',
  explanationSv: 'x',
  source: { chapter },
})

/** 13 chapters with 10 questions each, except chapter 10 with 40 (like the real bank's biggest chapter). */
const pool: QuizQuestion[] = Array.from({ length: 13 }, (_, i) => i + 1).flatMap((c) =>
  Array.from({ length: c === 10 ? 40 : 10 }, (_, n) => q(c, n + 1)),
)

beforeEach(() => localStorage.clear())

describe('pickExamQuestions', () => {
  it('draws the asked number without repeats, from every chapter, in book order', () => {
    const picked = pickExamQuestions(pool, 60, seededRandom('t'))
    expect(picked).toHaveLength(60)
    expect(new Set(picked.map((x) => x.id)).size).toBe(60)
    const chapters = picked.map((x) => x.source.chapter)
    expect(new Set(chapters).size).toBe(13)
    expect([...chapters].sort((a, b) => a - b)).toEqual(chapters)
  })

  it('gives bigger chapters more questions, in proportion to the bank', () => {
    const picked = pickExamQuestions(pool, 60, seededRandom('t'))
    const count = (c: number) => picked.filter((x) => x.source.chapter === c).length
    // 40 of 160 questions is a quarter of the bank, so about 15 of 60.
    expect(count(10)).toBeGreaterThanOrEqual(13)
    expect(count(10)).toBeLessThanOrEqual(17)
    for (let c = 1; c <= 13; c++) expect(count(c), `chapter ${c}`).toBeGreaterThanOrEqual(1)
  })

  it('never asks for more than a chapter has, and caps at the pool size', () => {
    const small = [q(1, 1), q(1, 2), q(2, 1)]
    expect(pickExamQuestions(small, 60, seededRandom('t'))).toHaveLength(3)
    expect(pickExamQuestions([], 20, seededRandom('t'))).toEqual([])
  })

  it('is deterministic for the same random source', () => {
    const a = pickExamQuestions(pool, 20, seededRandom('same')).map((x) => x.id)
    const b = pickExamQuestions(pool, 20, seededRandom('same')).map((x) => x.id)
    expect(a).toEqual(b)
  })
})

describe('timing', () => {
  it('allows one and a half minutes per question', () => {
    expect(examMinutes(60)).toBe(90)
    expect(examMinutes(20)).toBe(30)
  })

  it('formats the time left as m:ss and never below zero', () => {
    expect(formatTimeLeft(90 * 60_000)).toBe('90:00')
    expect(formatTimeLeft(61_000)).toBe('1:01')
    expect(formatTimeLeft(999)).toBe('0:00')
    expect(formatTimeLeft(-5000)).toBe('0:00')
    expect(msLeft('2026-10-30T10:00:00.000Z', new Date('2026-10-30T09:59:00.000Z'))).toBe(60_000)
    expect(msLeft(null, new Date())).toBeNull()
  })
})

describe('scoreExam', () => {
  it('counts right answers in total and per chapter, treating unanswered as wrong', () => {
    const questions = [q(1, 1), q(1, 2), q(2, 1)]
    const result = scoreExam(questions, { 'k1-q1': 'A', 'k1-q2': 'B' })
    expect(result).toEqual({
      score: 1,
      total: 3,
      unanswered: 1,
      byChapter: [
        { chapter: 1, score: 1, total: 2 },
        { chapter: 2, score: 0, total: 1 },
      ],
    })
  })
})

describe('exam session and history', () => {
  it('saves, reads back and clears the running exam, and tells subscribers', () => {
    let calls = 0
    const unsubscribe = subscribeExam(() => {
      calls += 1
    })
    const session = { ids: ['k1-q1'], answers: {}, index: 0, startedAt: '2026-10-30T09:00:00.000Z', deadline: null }
    saveExamSession(session)
    expect(parseExamSession(getExamSessionRaw())).toEqual(session)
    clearExamSession()
    expect(getExamSessionRaw()).toBeNull()
    expect(calls).toBe(2)
    unsubscribe()
  })

  it('rejects broken saved sessions', () => {
    expect(parseExamSession(null)).toBeUndefined()
    expect(parseExamSession('nope')).toBeUndefined()
    expect(parseExamSession('{"ids":"k1","answers":{},"index":0,"startedAt":"x","deadline":null}')).toBeUndefined()
    expect(parseExamSession('{"ids":[],"answers":{},"index":0,"startedAt":"x","deadline":null}')).toBeUndefined()
    expect(parseExamSession('{"ids":["a"],"answers":null,"index":0,"startedAt":"x","deadline":null}')).toBeUndefined()
    expect(parseExamSession('{"ids":["a"],"answers":{},"index":"0","startedAt":"x","deadline":null}')).toBeUndefined()
  })

  it('keeps the ten latest results, newest first', () => {
    for (let i = 0; i < 12; i++) {
      addExamResult({ finishedAt: `2026-10-${String(i + 1).padStart(2, '0')}`, score: i, total: 20, timed: true })
    }
    const history = getExamHistory()
    expect(history).toHaveLength(10)
    expect(history[0].score).toBe(11)
    expect(history[9].score).toBe(2)
  })

  it('returns an empty history for broken data', () => {
    localStorage.setItem('medborgarskap-exam-history-v1', '{"not":"a list"}')
    expect(getExamHistory()).toEqual([])
  })
})
