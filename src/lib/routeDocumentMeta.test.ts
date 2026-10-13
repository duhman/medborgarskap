import { describe, expect, it } from 'vitest'
import { canonicalPathname, canonicalUrl } from './routeDocumentMeta'

describe('canonicalPathname', () => {
  it('normalizes home and trailing slashes', () => {
    expect(canonicalPathname('/')).toBe('/')
    expect(canonicalPathname('/kapitel/')).toBe('/kapitel')
    expect(canonicalPathname('/kapitel/landet-sverige/')).toBe('/kapitel/landet-sverige')
  })
})

describe('canonicalUrl', () => {
  it('builds absolute URLs on the live host', () => {
    expect(canonicalUrl('/')).toBe('https://medborgarskap.adrianmarten.net/')
    expect(canonicalUrl('/behover-jag')).toBe('https://medborgarskap.adrianmarten.net/behover-jag')
    expect(canonicalUrl('/kapitel/')).toBe('https://medborgarskap.adrianmarten.net/kapitel')
  })
})
