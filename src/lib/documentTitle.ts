import { chapterMetaList } from '../content/chapters/meta'

export const SITE_TITLE = 'Medborgarskap'

/** Home title: names the exam so search and AI answers can match it. */
export const HOME_TITLE = 'Medborgarskapsprovet: gratis övningsfrågor och studiehjälp'

const staticPageNames: Record<string, string> = {
  '/404': 'Sidan hittades inte',
  '/behover-jag': 'Behöver jag provet?',
  '/kapitel': 'Kapitel i Sverige i fokus',
  '/provfragor': 'UHR:s exempel på provfrågor',
  '/studieplan': 'Studieplan inför medborgarskapsprovet',
  '/ovning/blandat': 'Blandade övningsfrågor',
  '/ovning/mina-fel': 'Öva dina fel',
  '/ovning/smart': 'Träna smart',
  '/ovning/prov': 'Provsimulering',
  '/vanliga-fragor': 'Vanliga frågor om medborgarskapsprovet',
  '/om': 'Om Medborgarskap',
  '/integritet': 'Integritetspolicy',
  '/villkor': 'Användarvillkor',
}

function chapterLabel(slug: string): string | null {
  const chapter = chapterMetaList.find((c) => c.slug === slug)
  return chapter ? `Kapitel ${chapter.number}: ${chapter.title}` : null
}

function pageName(pathname: string): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (path in staticPageNames) return staticPageNames[path]

  const chapterMatch = path.match(/^\/kapitel\/([^/]+)$/)
  if (chapterMatch) return chapterLabel(chapterMatch[1]) ?? 'Kapitlet hittades inte'

  const quizMatch = path.match(/^\/ovning\/([^/]+)$/)
  if (quizMatch) {
    const chapter = chapterMetaList.find((c) => c.slug === quizMatch[1])
    return chapter ? `Övningsfrågor kapitel ${chapter.number}: ${chapter.title}` : 'Övningen hittades inte'
  }

  return null
}

/** Dokumenttitel per route, format "<Sidnamn> | Medborgarskap". Startsidan använder HOME_TITLE. */
export function getDocumentTitle(pathname: string): string {
  const name = pageName(pathname)
  if (!pathname || pathname === '/') return HOME_TITLE
  return `${name ?? 'Sidan hittades inte'} | ${SITE_TITLE}`
}
