import { chapterMetaList, sverigeIFokusPdfUrl } from '../content/chapters/meta'
import { getDocumentDescription } from '../lib/documentDescription'
import { getDocumentTitle, SITE_TITLE } from '../lib/documentTitle'
import { canonicalPathname, canonicalUrl, SITE_ORIGIN } from '../lib/routeDocumentMeta'

type JsonLd = Record<string, unknown>

const AUTHOR = {
  '@type': 'Person',
  '@id': 'https://adrianmarten.net/#person',
  name: 'Adrian Martén',
  url: 'https://adrianmarten.net',
} as const

const SOURCE = {
  '@type': 'CreativeWork',
  name: 'Sverige i fokus',
  url: sverigeIFokusPdfUrl,
  publisher: { '@type': 'GovernmentOrganization', name: 'Universitets- och högskolerådet (UHR)', url: 'https://www.uhr.se' },
} as const

function breadcrumbs(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  }
}

/**
 * Structured data per route. Every field mirrors text that is visible on the page,
 * so the markup stays in line with Google's structured data guidelines.
 */
export function routeJsonLd(pathname: string, lastModified?: string): JsonLd[] {
  const path = canonicalPathname(pathname)
  const url = canonicalUrl(path)
  const name = getDocumentTitle(path)
  const description = getDocumentDescription(path)
  const dates = lastModified ? { dateModified: lastModified } : {}

  if (path === '/') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        name: SITE_TITLE,
        url,
        description,
        inLanguage: 'sv',
        author: AUTHOR,
        publisher: AUTHOR,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: SITE_TITLE,
        url,
        description,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        inLanguage: 'sv',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'SEK' },
        author: AUTHOR,
        isBasedOn: SOURCE,
        ...dates,
      },
    ]
  }

  const chapterMatch = path.match(/^\/(kapitel|ovning)\/([^/]+)$/)
  const isStaticPage = path === '/ovning/blandat' || path === '/ovning/mina-fel'
  if (chapterMatch && !isStaticPage) {
    const [, kind, slug] = chapterMatch
    const chapter = chapterMetaList.find((c) => c.slug === slug)
    if (!chapter) return []
    const isQuiz = kind === 'ovning'
    return [
      {
        '@context': 'https://schema.org',
        '@type': isQuiz ? 'Quiz' : 'LearningResource',
        name,
        headline: name,
        url,
        description,
        inLanguage: 'sv',
        isAccessibleForFree: true,
        learningResourceType: isQuiz ? 'Övningsfrågor' : 'Studieguide',
        educationalUse: 'Förberedelse inför medborgarskapsprovet',
        about: chapter.title,
        position: chapter.number,
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        isBasedOn: SOURCE,
        author: AUTHOR,
        ...dates,
      },
      breadcrumbs([
        { name: SITE_TITLE, path: '/' },
        { name: 'Kapitel', path: '/kapitel' },
        { name: `Kapitel ${chapter.number}: ${chapter.title}`, path: `/kapitel/${slug}` },
        ...(isQuiz ? [{ name: 'Övning', path: path }] : []),
      ]),
    ]
  }

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name,
      url,
      description,
      inLanguage: 'sv',
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      author: AUTHOR,
      ...dates,
    },
    breadcrumbs([
      { name: SITE_TITLE, path: '/' },
      { name: name.replace(` | ${SITE_TITLE}`, ''), path },
    ]),
  ]
}
