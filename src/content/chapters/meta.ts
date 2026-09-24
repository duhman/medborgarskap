import type { ChapterContent } from '../types'
import { landetSverige } from './landet-sverige'
import { saHarStyrsSverige } from './sa-har-styrs-sverige'
import { sverigesDemokratiskaSystem } from './sveriges-demokratiska-system'

const PDF =
  'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/sverige-i-fokus_.pdf'

const UHR = 'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial'

export const sverigeIFokusPdfUrl = PDF

type ChapterMeta = Pick<
  ChapterContent,
  'slug' | 'number' | 'title' | 'mp3Url'
> & { stubIntro: string }

const stubIntro =
  'Kapitlet finns i UHR:s utbildningsmaterial. Läs och lyssna via länkarna nedan. Övningsfrågor kommer i en senare uppdatering.'

export const chapterMetaList: ChapterMeta[] = [
  {
    number: 1,
    slug: 'landet-sverige',
    title: 'Landet Sverige',
    mp3Url: `${UHR}/02_landet-sverige.mp3`,
    stubIntro: landetSverige.intro,
  },
  {
    number: 2,
    slug: 'sveriges-demokratiska-system',
    title: 'Sveriges demokratiska system',
    mp3Url: `${UHR}/03_sveriges-demokratiska-system.mp3`,
    stubIntro: sverigesDemokratiskaSystem.intro,
  },
  {
    number: 3,
    slug: 'sa-har-styrs-sverige',
    title: 'Så här styrs Sverige',
    mp3Url: `${UHR}/04_sa-har-styrs-sverige.mp3`,
    stubIntro: saHarStyrsSverige.intro,
  },
  {
    number: 4,
    slug: 'politiska-val-och-partier',
    title: 'Politiska val och partier',
    mp3Url: `${UHR}/05_politiska-val-och-partier.mp3`,
    stubIntro,
  },
  {
    number: 5,
    slug: 'lag-och-ratt',
    title: 'Lag och rätt',
    mp3Url: `${UHR}/06_lag-och-ratt.mp3`,
    stubIntro,
  },
  {
    number: 6,
    slug: 'mediernas-roll',
    title: 'Mediernas roll',
    mp3Url: `${UHR}/07_mediernas-roll.mp3`,
    stubIntro,
  },
  {
    number: 7,
    slug: 'manskliga-rattigheter',
    title: 'Mänskliga rättigheter',
    mp3Url: `${UHR}/08_manskliga-rattigheter.mp3`,
    stubIntro,
  },
  {
    number: 8,
    slug: 'arbetsmarknad-och-privatekonomi',
    title: 'Arbetsmarknad och privatekonomi',
    mp3Url: `${UHR}/09_arbetsmarknad-och-privatekonomi.mp3`,
    stubIntro,
  },
  {
    number: 9,
    slug: 'valfardssamhallet',
    title: 'Välfärdssamhället',
    mp3Url: `${UHR}/10_valfardssamhallet.mp3`,
    stubIntro,
  },
  {
    number: 10,
    slug: 'sveriges-moderna-historia',
    title: 'Sveriges moderna historia',
    mp3Url: `${UHR}/11_sveriges-moderna-historia.mp3`,
    stubIntro,
  },
  {
    number: 11,
    slug: 'sverige-och-omvarlden',
    title: 'Sverige och omvärlden',
    mp3Url: `${UHR}/12_sverige-och-omvarlden_uppdaterat-ljud-260811.mp3`,
    stubIntro,
  },
  {
    number: 12,
    slug: 'en-sekular-stat-och-ett-mangreligiost-land',
    title: 'En sekulär stat och ett mångreligiöst land',
    mp3Url: `${UHR}/13_en-sekular-stat-och-ett-mangreligiost-land_uppdaterat-ljud-260811.mp3`,
    stubIntro,
  },
  {
    number: 13,
    slug: 'traditioner-och-hogtider',
    title: 'Traditioner och högtider',
    mp3Url: `${UHR}/14_traditioner-och-hogtider.mp3`,
    stubIntro,
  },
]

const fullChapters: ChapterContent[] = [
  landetSverige,
  sverigesDemokratiskaSystem,
  saHarStyrsSverige,
]

const fullBySlug = new Map(fullChapters.map((c) => [c.slug, c]))

export function getChapterBySlug(slug: string): ChapterContent | undefined {
  const full = fullBySlug.get(slug)
  if (full) return full

  const meta = chapterMetaList.find((c) => c.slug === slug)
  if (!meta) return undefined

  return {
    slug: meta.slug,
    number: meta.number,
    title: meta.title,
    mp3Url: meta.mp3Url,
    intro: meta.stubIntro,
    questions: [],
    isStub: true,
  }
}

export function getAllChapters(): ChapterContent[] {
  return chapterMetaList.map((meta) => {
    const full = fullBySlug.get(meta.slug)
    if (full) return full
    return {
      slug: meta.slug,
      number: meta.number,
      title: meta.title,
      mp3Url: meta.mp3Url,
      intro: meta.stubIntro,
      questions: [],
      isStub: true,
    }
  })
}

export const inledningMp3Url = `${UHR}/01_inledning.mp3`
