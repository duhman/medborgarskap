import { describe, expect, it } from 'vitest'
import { policyFixtures, validatePolicyFixtures } from './policy'

describe('Medborgarskap policy fixtures', () => {
  it('keeps official-source policy traps provider-independent and pending human review', () => {
    expect(policyFixtures).toHaveLength(12)
    expect(policyFixtures.every((fixture) => fixture.templateGenerated === false)).toBe(true)
    expect(policyFixtures.every((fixture) => fixture.humanSemanticReview === 'pending')).toBe(true)
    expect(() => validatePolicyFixtures(policyFixtures)).not.toThrow()
  })

  it('rejects arbitrary source URLs and unknown expected behavior', () => {
    const arbitraryUrl = structuredClone(policyFixtures)
    arbitraryUrl[0].sourceUrls = ['https://example.invalid/not-an-authority']
    expect(() => validatePolicyFixtures(arbitraryUrl)).toThrow('Arbitrary policy source URL')
    const unknownBehavior = structuredClone(policyFixtures)
    unknownBehavior[0].expected = 'answer_anyway' as never
    expect(() => validatePolicyFixtures(unknownBehavior)).toThrow('Unknown expected behavior')
  })
})
