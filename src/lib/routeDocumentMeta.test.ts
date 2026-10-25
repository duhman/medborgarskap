import { describe, expect, it } from 'vitest'
import { applyRouteDocumentMeta, canonicalPathname, canonicalUrl } from './routeDocumentMeta'

describe('canonicalPathname', () => {
  it('normalizes home and trailing slashes', () => {
    expect(canonicalPathname('/')).toBe('/')
    expect(canonicalPathname('/kapitel/')).toBe('/kapitel')
    expect(canonicalPathname('/kapitel/landet-sverige/')).toBe('/kapitel/landet-sverige')
  })
})

describe('canonicalUrl', () => {
  it('builds absolute URLs on the live host', () => {
    expect(canonicalUrl('/')).toBe('https://provamedborgarskap.se/')
    expect(canonicalUrl('/behover-jag')).toBe('https://provamedborgarskap.se/behover-jag')
    expect(canonicalUrl('/kapitel/')).toBe('https://provamedborgarskap.se/kapitel')
  })
})

describe('applyRouteDocumentMeta', () => {
  it('upserts twitter:url to match the route canonical URL', () => {
    document.head.innerHTML = '<title>Medborgarskap</title>'
    applyRouteDocumentMeta('/kapitel/landet-sverige')
    const twitterUrl = document.head.querySelector('meta[name="twitter:url"]')
    expect(twitterUrl?.getAttribute('content')).toBe(
      'https://provamedborgarskap.se/kapitel/landet-sverige',
    )
  })

  it('sets og:image and twitter:card on navigation', () => {
    document.head.innerHTML = '<title>Medborgarskap</title>'
    applyRouteDocumentMeta('/om')
    expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://provamedborgarskap.se/og-image.png',
    )
    expect(document.head.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image',
    )
  })
})

describe('missing-page navigation', () => {
  it('clears noindex when navigating from a missing URL to a public page', () => {
    applyRouteDocumentMeta('/does-not-exist')
    expect(document.title).toContain('hittades inte')
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow')
    applyRouteDocumentMeta('/kapitel/landet-sverige')
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow')
  })
})
