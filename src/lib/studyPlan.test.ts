import { describe, expect, it } from 'vitest'
import { chapterMetaList } from '../content/chapters/meta'
import { addDays, buildPlan, currentWeek, reviewWeeks, weeksUntil } from './studyPlan'

describe('study plan', () => {
  it.each([1, 2, 3, 4, 8, 12, 16, 22, 30])('covers every chapter once, in order, in %i weeks', (weeks) => {
    const plan = buildPlan(chapterMetaList, weeks)
    expect(plan).toHaveLength(Math.max(weeks, 1))
    const order = plan.flatMap((w) => w.chapters.map((c) => c.number))
    expect(order).toEqual(chapterMetaList.map((c) => c.number))
    for (const w of plan) expect(w.review).toBe(w.chapters.length === 0)
    expect(plan[0].review).toBe(false)
    if (weeks >= 3) expect(plan.at(-1)?.review).toBe(true)
  })

  it('keeps weeks about the same size and leaves repetition at the end', () => {
    const plan = buildPlan(chapterMetaList, 8)
    expect(reviewWeeks(8)).toBe(2)
    expect(plan.slice(-2).every((w) => w.review)).toBe(true)
    const sizes = plan.filter((w) => !w.review).map((w) => w.chapters.length)
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(2)
  })

  it('finds the current week and counts weeks', () => {
    const s = { start: '2026-10-26', weeks: 8 }
    expect(currentWeek(s, '2026-10-20')).toBe(1)
    expect(currentWeek(s, '2026-11-01')).toBe(1)
    expect(currentWeek(s, '2026-11-02')).toBe(2)
    expect(currentWeek(s, '2027-06-01')).toBe(8)
    expect(weeksUntil('2026-10-25', '2027-04-01')).toBe(22)
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
  })
})
