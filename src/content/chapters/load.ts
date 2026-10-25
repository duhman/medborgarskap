import { use } from 'react'
import type { ChapterContent, QuizQuestion } from '../types'
import { chapterMetaList } from './meta'

/**
 * Varje kapitel blir en egen JS-fil i bygget, så en sida laddar bara de frågor den visar.
 * Sidor läser kapitlen med useChapter/useAllQuestions, som pausar (Suspense) tills filen finns.
 * main.tsx och prerender laddar sidans kapitel i förväg, så den förrenderade sidan hydreras
 * direkt utan att pausa.
 */
const loaders: Record<string, () => Promise<ChapterContent>> = {
  'landet-sverige': () => import('./landet-sverige').then((m) => m.landetSverige),
  'sveriges-demokratiska-system': () =>
    import('./sveriges-demokratiska-system').then((m) => m.sverigesDemokratiskaSystem),
  'sa-har-styrs-sverige': () => import('./sa-har-styrs-sverige').then((m) => m.saHarStyrsSverige),
  'politiska-val-och-partier': () =>
    import('./politiska-val-och-partier').then((m) => m.politiskaValOchPartier),
  'lag-och-ratt': () => import('./lag-och-ratt').then((m) => m.lagOchRatt),
  'mediernas-roll': () => import('./mediernas-roll').then((m) => m.mediernasRoll),
  'manskliga-rattigheter': () => import('./manskliga-rattigheter').then((m) => m.manskligaRattigheter),
  'arbetsmarknad-och-privatekonomi': () =>
    import('./arbetsmarknad-och-privatekonomi').then((m) => m.arbetsmarknadOchPrivatekonomi),
  valfardssamhallet: () => import('./valfardssamhallet').then((m) => m.valfardssamhallet),
  'sveriges-moderna-historia': () =>
    import('./sveriges-moderna-historia').then((m) => m.sverigesModernaHistoria),
  'sverige-och-omvarlden': () => import('./sverige-och-omvarlden').then((m) => m.sverigeOchOmvarlden),
  'en-sekular-stat-och-ett-mangreligiost-land': () =>
    import('./en-sekular-stat-och-ett-mangreligiost-land').then(
      (m) => m.enSekularStatOchEttMangreligiostLand,
    ),
  'traditioner-och-hogtider': () =>
    import('./traditioner-och-hogtider').then((m) => m.traditionerOchHogtider),
}

const loaded = new Map<string, ChapterContent>()
const pending = new Map<string, Promise<ChapterContent>>()

export function isChapterSlug(slug: string): boolean {
  return Object.hasOwn(loaders, slug)
}

/** Laddar ett kapitel en gång; senare anrop får samma promise. */
export function loadChapter(slug: string): Promise<ChapterContent> {
  const existing = pending.get(slug)
  if (existing) return existing
  const load = loaders[slug]
  if (!load) return Promise.reject(new Error(`Unknown chapter ${slug}`))
  const promise = load().then(
    (chapter) => {
      loaded.set(slug, chapter)
      return chapter
    },
    (error: unknown) => {
      // Let a later render retry, for example after a flaky connection.
      pending.delete(slug)
      throw error
    },
  )
  pending.set(slug, promise)
  return promise
}

let allPromise: Promise<ChapterContent[]> | undefined

export function loadAllChapters(): Promise<ChapterContent[]> {
  allPromise ??= Promise.all(chapterMetaList.map((c) => loadChapter(c.slug))).catch((error: unknown) => {
    allPromise = undefined
    throw error
  })
  return allPromise
}

/** Kapitlets fulla innehåll, eller undefined för en okänd slug. Pausar tills kapitlet är laddat. */
export function useChapter(slug: string): ChapterContent | undefined {
  if (!isChapterSlug(slug)) return undefined
  return loaded.get(slug) ?? use(loadChapter(slug))
}

let allQuestions: QuizQuestion[] | undefined

/** Alla frågor från alla kapitel, i kapitelordning. Pausar tills alla kapitel är laddade. */
export function useAllQuestions(): QuizQuestion[] {
  if (!allQuestions && chapterMetaList.every((c) => loaded.has(c.slug))) {
    allQuestions = chapterMetaList.flatMap((c) => loaded.get(c.slug)!.questions)
  }
  if (allQuestions) return allQuestions
  use(loadAllChapters())
  return chapterMetaList.flatMap((c) => loaded.get(c.slug)!.questions)
}

/** Laddar de kapitel en sida behöver, innan den förrenderade sidan hydreras. */
export function preloadRouteData(pathname: string): Promise<unknown> {
  const path = pathname.replace(/\/+$/, '')
  if (path === '/ovning/blandat' || path === '/ovning/mina-fel') return loadAllChapters()
  const slug = path.match(/^\/(?:kapitel|ovning)\/([^/]+)$/)?.[1]
  if (slug && isChapterSlug(slug)) return loadChapter(slug)
  return Promise.resolve()
}
