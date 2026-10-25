import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAllProgress,
  clearPathwayAnswers,
  clearQuizSession,
  derivePathwayOutcome,
  getMistakeIds,
  getProgressState,
  localDay,
  getPathwayAnswers,
  getQuizSessionRaw,
  parseQuizSession,
  recordAnswers,
  resetProgressForTests,
  savePathwayAnswers,
  saveQuizSession,
  subscribeProgress,
  type PathwayAnswers,
} from './progress'

describe('quiz sessions', () => {
  it('saves, reads back and clears an unfinished quiz, and tells subscribers', () => {
    let calls = 0
    const unsubscribe = subscribeProgress(() => {
      calls += 1
    })
    saveQuizSession('lag-och-ratt', { attempt: 0, index: 3, answers: { q1: 'A' }, savedAt: '2026-10-25' })
    expect(parseQuizSession(getQuizSessionRaw('lag-och-ratt'))).toMatchObject({ index: 3, answers: { q1: 'A' } })
    clearQuizSession('lag-och-ratt')
    expect(getQuizSessionRaw('lag-och-ratt')).toBeNull()
    expect(calls).toBe(2)
    unsubscribe()
  })

  it('ignores broken saved data', () => {
    expect(parseQuizSession('not json')).toBeUndefined()
    expect(parseQuizSession('{"index":"2"}')).toBeUndefined()
    expect(parseQuizSession('{"index":1.5,"attempt":0,"answers":{}}')).toBeUndefined()
    expect(parseQuizSession(null)).toBeUndefined()
    expect(parseQuizSession('{"index":1,"attempt":0,"answers":{},"ids":"q1"}')).toBeUndefined()
  })

  it('keeps the question ids of a mixed set', () => {
    saveQuizSession('blandat', { attempt: 0, index: 1, answers: {}, savedAt: '2026-10-25', ids: ['q2', 'q1'] })
    expect(parseQuizSession(getQuizSessionRaw('blandat'))?.ids).toEqual(['q2', 'q1'])
    clearQuizSession('blandat')
  })
})

describe('clearing saved data', () => {
  beforeEach(() => resetProgressForTests())

  it('clears checklist answers only', () => {
    savePathwayAnswers({ ageBracket: '16-66' })
    recordAnswers([{ id: 'q1', correct: false }])
    clearPathwayAnswers()
    expect(getPathwayAnswers()).toEqual({})
    expect(getMistakeIds()).toEqual(['q1'])
  })

  it('clears progress, mistakes and unfinished quizzes but nothing else', () => {
    localStorage.setItem('other-site-key', 'x')
    recordAnswers([{ id: 'q1', correct: false }])
    saveQuizSession('lag-och-ratt', { attempt: 0, index: 2, answers: {}, savedAt: '2026-10-25' })
    clearAllProgress()
    expect(getMistakeIds()).toEqual([])
    expect(getQuizSessionRaw('lag-och-ratt')).toBeNull()
    expect(localStorage.getItem('other-site-key')).toBe('x')
    localStorage.removeItem('other-site-key')
  })
})

describe('recordAnswers', () => {
  beforeEach(() => resetProgressForTests())

  it('adds wrong answers, removes them once answered right and ignores skipped questions', () => {
    recordAnswers([
      { id: 'a', correct: false },
      { id: 'b', correct: false },
      { id: 'c', correct: true },
    ])
    expect(getMistakeIds().sort()).toEqual(['a', 'b'])
    recordAnswers([
      { id: 'a', correct: true },
      { id: 'b', correct: null },
    ])
    expect(getMistakeIds()).toEqual(['b'])
  })
})

describe('derivePathwayOutcome', () => {
  it('treats age 67+ as maybe exempt', () => {
    expect(derivePathwayOutcome({ ageBracket: '67plus' })).toBe('maybe-exempt')
  })

  it('treats school and komvux yes as maybe exempt', () => {
    expect(derivePathwayOutcome({ schoolSamhall: 'yes' })).toBe('maybe-exempt')
    expect(derivePathwayOutcome({ komvuxFolk: 'yes' })).toBe('maybe-exempt')
  })

  it('ignores a stored SFI D answer, since SFI only counts for the language requirement', () => {
    expect(
      derivePathwayOutcome({
        ageBracket: '16-66',
        schoolSamhall: 'no',
        komvuxFolk: 'no',
        sfiKnowledgeAlternate: 'yes',
      }),
    ).toBe('likely-needed')
  })

  it('does not exempt from studying SFI language alone', () => {
    const base: PathwayAnswers = {
      ageBracket: '16-66',
      schoolSamhall: 'no',
      komvuxFolk: 'no',
      sfiPath: 'yes',
    }
    expect(derivePathwayOutcome(base)).toBe('likely-needed')
  })

  it('returns likely needed when no alternate paths apply', () => {
    expect(
      derivePathwayOutcome({
        ageBracket: '16-66',
        schoolSamhall: 'no',
        komvuxFolk: 'no',
        sfiKnowledgeAlternate: 'no',
      }),
    ).toBe('likely-needed')
  })

  it('preserves backward compatibility when knowledge alternate is unset', () => {
    expect(
      derivePathwayOutcome({
        ageBracket: '16-66',
        schoolSamhall: 'no',
        komvuxFolk: 'no',
      }),
    ).toBe('likely-needed')
  })

  it('returns unclear when any answer is unsure', () => {
    expect(
      derivePathwayOutcome({
        ageBracket: '16-66',
        schoolSamhall: 'no',
        komvuxFolk: 'unsure',
      }),
    ).toBe('unclear')
  })
})

describe('subscribeProgress', () => {
  it('notifies on writes in another tab and stops after unsubscribe', async () => {
    const { subscribeProgress } = await import('./progress')
    let calls = 0
    const off = subscribeProgress(() => calls++)
    window.dispatchEvent(new StorageEvent('storage', { key: 'medborgarskap-progress-v1' }))
    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }))
    expect(calls).toBe(1)
    off()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))
    expect(calls).toBe(1)
  })
})

describe('question history', () => {
  beforeEach(() => resetProgressForTests())

  it('counts right answers in a row and resets them on a wrong answer', () => {
    const day = new Date(2026, 9, 25, 12)
    recordAnswers([{ id: 'k1-q1', correct: true }], day)
    recordAnswers([{ id: 'k1-q1', correct: true }, { id: 'k1-q2', correct: null }], day)
    expect(getProgressState().history['k1-q1']).toEqual({ right: 2, wrong: 0, streak: 2, last: '2026-10-25' })
    expect(getProgressState().history['k1-q2']).toBeUndefined()
    recordAnswers([{ id: 'k1-q1', correct: false }], new Date(2026, 9, 26, 9))
    expect(getProgressState().history['k1-q1']).toEqual({ right: 2, wrong: 1, streak: 0, last: '2026-10-26' })
    expect(localDay(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
