import { describe, expect, it } from 'vitest'
import { faqEntries } from '../content/faq'
import { officialLinks, uhrStatus } from './status'

describe('uhrStatus', () => {
  it('keeps the August 2026 trial result separate from the unpublished next threshold', () => {
    expect(uhrStatus.notes).toContain('15 augusti 2026')
    expect(uhrStatus.notes).toContain('28 av 40')
    expect(uhrStatus.notes).toMatch(/inte publicerat.*godkäntgräns för nästa tillfälle/i)
  })

  it('backs the historical FAQ result with its own source and preserves future uncertainty', () => {
    const entry = faqEntries.find((item) => item.id === 'hur-ser-provet-ut')
    expect(entry).toBeDefined()
    const answer = entry!.answer.join(' ')
    expect(answer).toMatch(/15 augusti 2026.*28 av 40/)
    expect(answer).toMatch(/inte publicerat.*godkäntgräns för nästa tillfälle/i)
    expect(entry!.sources.some((source) => source.url.includes('resultaten-fran-medborgarskapsprovet'))).toBe(true)
    expect(officialLinks.trialResults).toContain('resultaten-fran-medborgarskapsprovet')
  })
})
