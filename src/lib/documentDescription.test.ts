import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SITE_DESCRIPTION,
  getDocumentDescription,
  truncateMetaDescription,
} from './documentDescription'

describe('truncateMetaDescription', () => {
  it('leaves short text unchanged', () => {
    expect(truncateMetaDescription('Kort text.')).toBe('Kort text.')
  })

  it('truncates long text on a word boundary', () => {
    const long = 'a'.repeat(200)
    expect(truncateMetaDescription(`${long} extra words here`)).toHaveLength(160)
  })
})

describe('getDocumentDescription', () => {
  it('uses the default on home and unknown paths', () => {
    expect(getDocumentDescription('/')).toBe(DEFAULT_SITE_DESCRIPTION)
    expect(getDocumentDescription('/finns-inte')).toBe(DEFAULT_SITE_DESCRIPTION)
  })

  it('describes static pages', () => {
    expect(getDocumentDescription('/behover-jag')).toContain('medborgarskapsprov')
    expect(getDocumentDescription('/integritet')).toContain('Integritetspolicy')
  })

  it('uses chapter intro for study pages', () => {
    const description = getDocumentDescription('/kapitel/landet-sverige')
    expect(description).toContain('Sverige ligger i Norden')
    expect(description.length).toBeLessThanOrEqual(160)
  })

  it('describes quiz pages with chapter title', () => {
    expect(getDocumentDescription('/ovning/politiska-val-och-partier')).toBe(
      'Flervalsövning till kapitel 4: Politiska val och partier. Baserat på UHR:s Sverige i fokus.',
    )
  })
})
