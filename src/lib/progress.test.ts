import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearQuizSession,
  derivePathwayOutcome,
  getMistakeIds,
  getQuizSessionRaw,
  parseQuizSession,
  recordAnswers,
  resetProgressForTests,
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
    expect(parseQuizSession(null)).toBeUndefined()
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
