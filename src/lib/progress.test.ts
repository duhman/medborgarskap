import { describe, expect, it } from 'vitest'
import { derivePathwayOutcome, type PathwayAnswers } from './progress'

describe('derivePathwayOutcome', () => {
  it('treats age 67+ as maybe exempt', () => {
    expect(derivePathwayOutcome({ ageBracket: '67plus' })).toBe('maybe-exempt')
  })

  it('treats school and komvux yes as maybe exempt', () => {
    expect(derivePathwayOutcome({ schoolSamhall: 'yes' })).toBe('maybe-exempt')
    expect(derivePathwayOutcome({ komvuxFolk: 'yes' })).toBe('maybe-exempt')
  })

  it('treats SFI D / Mig knowledge alternate yes as maybe exempt', () => {
    expect(
      derivePathwayOutcome({
        ageBracket: '16-66',
        schoolSamhall: 'no',
        komvuxFolk: 'no',
        sfiKnowledgeAlternate: 'yes',
      }),
    ).toBe('maybe-exempt')
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
        komvuxFolk: 'no',
        sfiKnowledgeAlternate: 'unsure',
      }),
    ).toBe('unclear')
  })
})
