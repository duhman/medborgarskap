import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAnalyticsConsent,
  purgeAnalyticsStorage,
  setAnalyticsConsent,
  subscribeAnalyticsConsent,
} from './analyticsConsent'

beforeEach(() => {
  localStorage.clear()
})

describe('analytics consent', () => {
  it('is unset until the visitor chooses, and the choice is saved (localStorage)', () => {
    expect(getAnalyticsConsent()).toBeNull()
    setAnalyticsConsent('granted')
    expect(getAnalyticsConsent()).toBe('granted')
    expect(localStorage.getItem('medborgarskap-analytics-consent-v1')).toBe('granted')
    setAnalyticsConsent('denied')
    expect(getAnalyticsConsent()).toBe('denied')
    expect(localStorage.getItem('medborgarskap-analytics-consent-v1')).toBe('denied')
  })

  it('treats an earlier opt-out as a no, and never treats unknown values as a yes', () => {
    localStorage.setItem('medborgarskap-analytics-opt-out', '1')
    expect(getAnalyticsConsent()).toBe('denied')
    localStorage.clear()
    localStorage.setItem('medborgarskap-analytics-consent-v1', 'yes')
    expect(getAnalyticsConsent()).toBeNull()
  })

  it('removes the old opt-out marker once a new choice is saved', () => {
    localStorage.setItem('medborgarskap-analytics-opt-out', '1')
    setAnalyticsConsent('granted')
    expect(localStorage.getItem('medborgarskap-analytics-opt-out')).toBeNull()
    expect(getAnalyticsConsent()).toBe('granted')
  })

  it('tells subscribers when the choice changes, and stops after unsubscribe', () => {
    let calls = 0
    const unsubscribe = subscribeAnalyticsConsent(() => {
      calls += 1
    })
    setAnalyticsConsent('granted')
    setAnalyticsConsent('denied')
    expect(calls).toBe(2)
    unsubscribe()
    setAnalyticsConsent('granted')
    expect(calls).toBe(2)
  })

  it('a no deletes the analytics id PostHog keeps in localStorage, and nothing else', () => {
    localStorage.setItem('ph_phc_abc_posthog', '{"distinct_id":"x"}')
    localStorage.setItem('medborgarskap-progress-v1', '{}')
    setAnalyticsConsent('denied')
    expect(localStorage.getItem('ph_phc_abc_posthog')).toBeNull()
    expect(localStorage.getItem('medborgarskap-progress-v1')).toBe('{}')
  })

  it('purging expires a PostHog cookie left by the old setup', () => {
    document.cookie = 'ph_phc_abc_posthog=1; path=/'
    document.cookie = 'other=1; path=/'
    purgeAnalyticsStorage()
    expect(document.cookie).not.toContain('ph_phc_abc_posthog')
    expect(document.cookie).toContain('other=1')
  })
})
