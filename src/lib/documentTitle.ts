import { chapterMetaList } from '../content/chapters/meta'

export const SITE_TITLE = 'Medborgarskap'

const staticPageNames: Record<string, string> = {
  '/behover-jag': 'Behöver jag provet?',
  '/kapitel': 'Kapitel i Sverige i fokus',
  '/provfragor': 'UHR:s exempel på provfrågor',
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
    const label = chapterLabel(quizMatch[1])
    return label ? `Övning, ${label}` : 'Quiz hittades inte'
  }

  return null
}

/** Dokumenttitel per route, format "<Sidnamn> | Medborgarskap". Startsidan heter bara Medborgarskap. */
export function getDocumentTitle(pathname: string): string {
  const name = pageName(pathname)
  return name ? `${name} | ${SITE_TITLE}` : SITE_TITLE
}
