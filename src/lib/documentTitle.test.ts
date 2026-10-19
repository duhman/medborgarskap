import { describe, expect, it } from 'vitest'
import { getDocumentTitle, HOME_TITLE } from './documentTitle'

describe('getDocumentTitle', () => {
  it('uses the home title on the home page and unknown paths', () => {
    expect(getDocumentTitle('/')).toBe(HOME_TITLE)
    expect(getDocumentTitle('/finns-inte')).toBe(HOME_TITLE)
  })

  it('titles static pages', () => {
    expect(getDocumentTitle('/behover-jag')).toBe('Behöver jag provet? | Medborgarskap')
    expect(getDocumentTitle('/kapitel/')).toBe('Kapitel i Sverige i fokus | Medborgarskap')
    expect(getDocumentTitle('/villkor')).toBe('Användarvillkor | Medborgarskap')
  })

  it('titles chapter and quiz pages with number and name', () => {
    expect(getDocumentTitle('/kapitel/politiska-val-och-partier')).toBe(
      'Kapitel 4: Politiska val och partier | Medborgarskap',
    )
    expect(getDocumentTitle('/ovning/politiska-val-och-partier')).toBe(
      'Övning, Kapitel 4: Politiska val och partier | Medborgarskap',
    )
  })

  it('handles unknown chapter slugs', () => {
    expect(getDocumentTitle('/kapitel/nope')).toBe('Kapitlet hittades inte | Medborgarskap')
    expect(getDocumentTitle('/ovning/nope')).toBe('Övningen hittades inte | Medborgarskap')
  })
})
