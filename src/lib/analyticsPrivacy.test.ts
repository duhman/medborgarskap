import { describe, expect, it } from 'vitest'
import { canonicalAnalyticsPath, sanitizeAnalyticsCapture } from './analyticsPrivacy'

const sentinels = {
  freeText: 'SENSITIVE_FREE_TEXT',
  answer: 'SENSITIVE_QUIZ_ANSWER',
  referrer: 'https://private.example/SENSITIVE_REFERRER',
  stack: 'SENSITIVE_STACK_TRACE',
  url: 'https://provamedborgarskap.se/ovning/landet-sverige?answer=SENSITIVE_QUERY#SENSITIVE_HASH',
}

describe('analytics privacy filter', () => {
  it('keeps an allowlisted page metric and removes URLs, referrers, browser fields and study data', () => {
    const capture = sanitizeAnalyticsCapture({
      event: '$pageview', uuid: 'event', properties: {
        $current_url: sentinels.url, $referrer: sentinels.referrer, $browser: 'Browser',
        selectedAnswer: sentinels.answer, input: sentinels.freeText, $exception_list: [{ stacktrace: sentinels.stack }],
      },
    }, true)
    expect(capture).toEqual({ event: '$pageview', uuid: 'event', properties: { $current_url: 'https://provamedborgarskap.se/ovning/landet-sverige' } })
    expect(JSON.stringify(capture)).not.toContain('SENSITIVE_')
  })

  it('keeps only finite Web Vitals values and valid session identifiers', () => {
    const capture = sanitizeAnalyticsCapture({
      event: '$web_vitals', uuid: 'event', properties: {
        $current_url: 'https://provamedborgarskap.se/kapitel', $web_vitals_LCP_value: 832,
        $web_vitals_INP_value: Infinity, $web_vitals_LCP_event: { element: sentinels.freeText },
        $session_id: '550e8400-e29b-41d4-a716-446655440000', $window_id: 'not-an-id',
      },
    }, true)
    expect(capture?.properties).toEqual({
      $current_url: 'https://provamedborgarskap.se/kapitel',
      $session_id: '550e8400-e29b-41d4-a716-446655440000',
      $web_vitals_LCP_value: 832,
    })
  })

  it('fails closed for withdrawn consent, automatic capture and unknown routes', () => {
    const capture = { event: '$autocapture', uuid: 'event', properties: { $current_url: sentinels.url, text: sentinels.freeText } }
    expect(sanitizeAnalyticsCapture(capture, true)).toBeNull()
    expect(sanitizeAnalyticsCapture({ ...capture, event: '$pageview' }, false)).toBeNull()
    expect(sanitizeAnalyticsCapture({ ...capture, event: '$pageview', properties: { $current_url: 'https://provamedborgarskap.se/private/SENSITIVE' } }, true)).toBeNull()
  })

  it('recognizes only canonical public routes', () => {
    expect(canonicalAnalyticsPath('/')).toBe('/')
    expect(canonicalAnalyticsPath('/kapitel/landet-sverige')).toBe('/kapitel/landet-sverige')
    expect(canonicalAnalyticsPath('/kapitel/unknown')).toBeUndefined()
    expect(canonicalAnalyticsPath('/integritet/')).toBe('/integritet')
  })
})
