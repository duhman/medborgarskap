import { chapterMetaList } from '../content/chapters/meta'

export const DEFAULT_SITE_DESCRIPTION =
  'Gratis, fristående studiehjälp till medborgarskapsprovet. Kapitel och övningar baserade på UHR:s Sverige i fokus.'

const META_DESCRIPTION_MAX = 160

const staticPageDescriptions: Record<string, string> = {
  '/behover-jag':
    'Svar på om du behöver medborgarskapsprov, med länkar till UHR och Migrationsverket.',
  '/kapitel': 'Alla kapitel i UHR:s Sverige i fokus, med ljud och studietips per kapitel.',
  '/provfragor': 'UHR:s exempel på provfrågor, samlade för egen övning utan inloggning.',
  '/om': 'Om Medborgarskap, källor och hur sidan hänger ihop med UHR:s officiella material.',
  '/integritet': 'Integritetspolicy för Medborgarskap: analys, cookies och hur du väljer bort spårning.',
  '/villkor': 'Användarvillkor för Medborgarskap, fristående studiehjälp till medborgarskapsprovet.',
}

function chapterBySlug(slug: string) {
  return chapterMetaList.find((c) => c.slug === slug) ?? null
}

export function truncateMetaDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (normalized.length <= max) return normalized
  const slice = normalized.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > 80 ? lastSpace : max - 1
  return `${slice.slice(0, cut).trim()}…`
}

/** Meta description for `<meta name="description">` and share tags on each route. */
export function getDocumentDescription(pathname: string): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  if (path in staticPageDescriptions) {
    return staticPageDescriptions[path]
  }

  const chapterMatch = path.match(/^\/kapitel\/([^/]+)$/)
  if (chapterMatch) {
    const chapter = chapterBySlug(chapterMatch[1])
    if (!chapter) {
      return 'Kapitlet hittades inte. Gå tillbaka till kapitelöversikten på Medborgarskap.'
    }
    return truncateMetaDescription(chapter.stubIntro)
  }

  const quizMatch = path.match(/^\/ovning\/([^/]+)$/)
  if (quizMatch) {
    const chapter = chapterBySlug(quizMatch[1])
    if (!chapter) {
      return 'Övningen hittades inte. Välj ett kapitel från kapitelöversikten.'
    }
    return `Flervalsövning till kapitel ${chapter.number}: ${chapter.title}. Baserat på UHR:s Sverige i fokus.`
  }

  return DEFAULT_SITE_DESCRIPTION
}
