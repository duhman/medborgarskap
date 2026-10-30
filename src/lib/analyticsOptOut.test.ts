import { beforeEach, describe, expect, it } from 'vitest'
import { isAnalyticsOptedOut, setAnalyticsOptOut, subscribeAnalyticsOptOut } from './analyticsOptOut'

beforeEach(() => {
  localStorage.clear()
})

describe('analytics opt-out', () => {
  it('is off until the visitor opts out, and the choice survives a reload (localStorage)', () => {
    expect(isAnalyticsOptedOut()).toBe(false)
    setAnalyticsOptOut(true)
    expect(isAnalyticsOptedOut()).toBe(true)
    expect(localStorage.getItem('medborgarskap-analytics-opt-out')).toBe('1')
    setAnalyticsOptOut(false)
    expect(isAnalyticsOptedOut()).toBe(false)
    expect(localStorage.getItem('medborgarskap-analytics-opt-out')).toBeNull()
  })

  it('tells subscribers when the choice changes, and stops after unsubscribe', () => {
    let calls = 0
    const unsubscribe = subscribeAnalyticsOptOut(() => {
      calls += 1
    })
    setAnalyticsOptOut(true)
    setAnalyticsOptOut(false)
    expect(calls).toBe(2)
    unsubscribe()
    setAnalyticsOptOut(true)
    expect(calls).toBe(2)
  })

  it('treats anything but the opt-out marker as opted in', () => {
    localStorage.setItem('medborgarskap-analytics-opt-out', 'yes')
    expect(isAnalyticsOptedOut()).toBe(false)
  })
})
