import { describe, expect, it } from 'vitest'
import { chapterMetaList } from '../content/chapters/meta'
import { routeJsonLd } from './jsonLd'

describe('routeJsonLd', () => {
  it('describes the home page as a website and a free web app', () => {
    const types = routeJsonLd('/').map((b) => b['@type'])
    expect(types).toEqual(['WebSite', 'WebApplication'])
  })

  it('marks chapters as learning resources based on Sverige i fokus', () => {
    const slug = chapterMetaList[0].slug
    const [resource, crumbs] = routeJsonLd(`/kapitel/${slug}`, '2026-10-09')
    expect(resource['@type']).toBe('LearningResource')
    expect(resource.dateModified).toBe('2026-10-09')
    expect(JSON.stringify(resource.isBasedOn)).toContain('uhr.se')
    expect(crumbs['@type']).toBe('BreadcrumbList')
  })

  it('marks exercises as quizzes and drops unknown chapters', () => {
    expect(routeJsonLd(`/ovning/${chapterMetaList[0].slug}`)[0]['@type']).toBe('Quiz')
    expect(routeJsonLd('/kapitel/finns-inte')).toEqual([])
    expect(routeJsonLd('/ovning/blandat')[0]['@type']).toBe('WebPage')
  })

  it('keeps dashes out of every string', () => {
    const all = JSON.stringify(
      ['/', '/om', ...chapterMetaList.map((c) => `/kapitel/${c.slug}`)].flatMap((p) => routeJsonLd(p)),
    )
    expect(all).not.toMatch(/[\u2013\u2014]/)
  })
})

describe('FAQ structured data', () => {
  it('mirrors every visible question and answer', async () => {
    const { faqEntries } = await import('../content/faq')
    const [faq] = routeJsonLd('/vanliga-fragor') as [{ '@type': string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] }]
    expect(faq['@type']).toBe('FAQPage')
    expect(faq.mainEntity.map((q) => q.name)).toEqual(faqEntries.map((f) => f.question))
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe(faqEntries[0].answer.join(' '))
  })
})

