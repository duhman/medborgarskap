import type { ChapterContent } from '../types.js'

const PDF =
  'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/sverige-i-fokus_.pdf'

const UHR = 'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial'

export const sverigeIFokusPdfUrl = PDF

/**
 * Versionsdatum för den PDF som frågorna granskas mot (UHR: "Korrigerad version 2026-08-10").
 * Byt bara när UHR publicerar en ny version. Testerna kräver då att varje kapitel granskas om.
 */
export const SOURCE_PDF_VERSION = '2026-08-10'

/** Länk till en viss sida i PDF:en (webbläsarens PDF-visare följer #page=). */
export function pdfPageUrl(page?: number): string {
  return page != null ? `${PDF}#page=${page}` : PDF
}

/** Sidintervall per kapitel enligt innehållsförteckningen i Sverige i fokus (korr. 2026-08-10). */
export const chapterPageRanges: Record<number, [first: number, last: number]> = {
  1: [5, 9],
  2: [10, 11],
  3: [12, 13],
  4: [14, 15],
  5: [16, 19],
  6: [20, 21],
  7: [22, 26],
  8: [27, 29],
  9: [30, 31],
  10: [32, 38],
  11: [39, 41],
  12: [42, 44],
  13: [45, 48],
}

/**
 * Det som listor, rubriker och SEO behöver om varje kapitel, utan själva frågorna. Hela kapitlet
 * (frågor, sammanfattning, ordlista) laddas per kapitel via ./load.ts så att startsidan slipper
 * ladda alla 389 frågor. content.test.ts kontrollerar att intro och antal frågor stämmer.
 */
export type ChapterMeta = Pick<ChapterContent, 'slug' | 'number' | 'title' | 'mp3Url' | 'intro'> & {
  questionCount: number
}

export const chapterMetaList: ChapterMeta[] = [
  {
    number: 1,
    slug: 'landet-sverige',
    title: 'Landet Sverige',
    mp3Url: `${UHR}/02_landet-sverige.mp3`,
    intro:
      'Sverige ligger i Norden i norra Europa och är ett avlångt land med en lång kust. Kapitlet handlar om Sveriges geografi, klimat och natur, om hur landet är indelat och var människor bor, om viktiga naturresurser och om hur Sverige arbetar med klimatförändringarna.',
    questionCount: 36,
  },
  {
    number: 2,
    slug: 'sveriges-demokratiska-system',
    title: 'Sveriges demokratiska system',
    mp3Url: `${UHR}/03_sveriges-demokratiska-system.mp3`,
    intro:
      'Demokrati betyder folkstyre: makten utgår från folket, som styr genom fria och rättvisa val. Kapitlet handlar om vad som krävs för en demokrati, hur man kan påverka samhället och vilka problem som kan försvaga demokratin, till exempel lågt valdeltagande, falsk information och segregation.',
    questionCount: 24,
  },
  {
    number: 3,
    slug: 'sa-har-styrs-sverige',
    title: 'Så här styrs Sverige',
    mp3Url: `${UHR}/04_sa-har-styrs-sverige.mp3`,
    intro:
      'Den politiska makten i Sverige är delad mellan stat, regioner och kommuner, och Sverige påverkas också av beslut i EU. Folket väljer politikerna, politikerna beslutar om lagar och budget och myndigheterna genomför besluten. Kapitlet tar också upp att Sverige är en konstitutionell monarki.',
    questionCount: 26,
  },
  {
    number: 4,
    slug: 'politiska-val-och-partier',
    title: 'Politiska val och partier',
    mp3Url: `${UHR}/05_politiska-val-och-partier.mp3`,
    intro:
      'Politiska partier samlar människor med gemensamma idéer om hur landet ska styras och försöker få väljarnas stöd. Kapitlet går igenom när val hålls, vem som får rösta, hur det går till att rösta och hur proportionella val fungerar.',
    questionCount: 25,
  },
  {
    number: 5,
    slug: 'lag-och-ratt',
    title: 'Lag och rätt',
    mp3Url: `${UHR}/06_lag-och-ratt.mp3`,
    intro:
      'Kapitlet handlar om lagar som alla måste följa. Det beskriver Sveriges fyra grundlagar och allemansrätten, och hur rättsväsendet med polis, åklagare och domstolar utreder brott och dömer på ett rättssäkert sätt.',
    questionCount: 37,
  },
  {
    number: 6,
    slug: 'mediernas-roll',
    title: 'Mediernas roll',
    mp3Url: `${UHR}/07_mediernas-roll.mp3`,
    intro:
      'Medier sprider nyheter, kunskap och information som påverkar alla i samhället. Kapitlet beskriver fria medier och offentlighetsprincipen, olika slags medier som public service, och varför det är viktigt att vara källkritisk.',
    questionCount: 23,
  },
  {
    number: 7,
    slug: 'manskliga-rattigheter',
    title: 'Mänskliga rättigheter',
    mp3Url: `${UHR}/08_manskliga-rattigheter.mp3`,
    intro:
      'Mänskliga rättigheter gäller alla och har påverkat lagarna i Sverige. Kapitlet tar upp FN:s förklaring om de mänskliga rättigheterna, jämställdhet mellan könen, barns rättigheter, skydd för minoriteter och arbetet mot diskriminering och hatbrott.',
    questionCount: 36,
  },
  {
    number: 8,
    slug: 'arbetsmarknad-och-privatekonomi',
    title: 'Arbetsmarknad och privatekonomi',
    mp3Url: `${UHR}/09_arbetsmarknad-och-privatekonomi.mp3`,
    intro:
      'Kapitlet beskriver hur arbetsmarknaden fungerar, med offentlig och privat sektor, arbetsgivare och fackförbund, kollektivavtal, lagar, skatt på lön och A-kassan. Det handlar också om privatekonomi: inkomster, utgifter, sparande, lån och skulder.',
    questionCount: 29,
  },
  {
    number: 9,
    slug: 'valfardssamhallet',
    title: 'Välfärdssamhället',
    mp3Url: `${UHR}/10_valfardssamhallet.mp3`,
    intro:
      'Välfärdssamhället ska ge alla invånare en grundläggande ekonomisk och social trygghet. Välfärden finansieras främst med skatter, som inkomstskatt, moms och arbetsgivaravgifter. Staten, regionerna och kommunerna har ansvar för olika delar av välfärden.',
    questionCount: 21,
  },
  {
    number: 10,
    slug: 'sveriges-moderna-historia',
    title: 'Sveriges moderna historia',
    mp3Url: `${UHR}/11_sveriges-moderna-historia.mp3`,
    intro:
      'På tvåhundra år har Sverige gått från ett fattigt jordbruksland till ett högteknologiskt välfärdssamhälle. Kapitlet följer industrialiseringen, folkrörelserna och demokratins genombrott, folkhemmet och krigsåren, rekordåren och informationssamhället.',
    questionCount: 47,
  },
  {
    number: 11,
    slug: 'sverige-och-omvarlden',
    title: 'Sverige och omvärlden',
    mp3Url: `${UHR}/12_sverige-och-omvarlden_uppdaterat-ljud-260811.mp3`,
    intro:
      'Sverige samarbetar med omvärlden på nordisk, europeisk och global nivå, bland annat i Nordiska rådet, EU, Europarådet och FN, och genom biståndsmyndigheten Sida. Kapitlet handlar också om Sveriges långa fred, det kalla kriget, medlemskapet i Nato och hur totalförsvaret är uppbyggt.',
    questionCount: 29,
  },
  {
    number: 12,
    slug: 'en-sekular-stat-och-ett-mangreligiost-land',
    title: 'En sekulär stat och ett mångreligiöst land',
    mp3Url: `${UHR}/13_en-sekular-stat-och-ett-mangreligiost-land_uppdaterat-ljud-260811.mp3`,
    intro:
      'Sverige är en sekulär stat där alla har religionsfrihet och fritt kan välja sin tro eller att inte tro. Kapitlet beskriver hur religionsfriheten växte fram, vilken roll religionen har i dag och historien om de fem största världsreligionerna i Sverige.',
    questionCount: 28,
  },
  {
    number: 13,
    slug: 'traditioner-och-hogtider',
    title: 'Traditioner och högtider',
    mp3Url: `${UHR}/14_traditioner-och-hogtider.mp3`,
    intro:
      'Traditioner är ett sätt att fira tillsammans och markera viktiga tidpunkter under året. Kapitlet går igenom årets högtider i Sverige, från nyår till jul, och visar att många har kristna eller ännu äldre rötter, medan nya traditioner har kommit med invandrare.',
    questionCount: 28,
  },
]

/** Alla kapitel i bokens ordning, utan frågor. */
export function getAllChapters(): ChapterMeta[] {
  return chapterMetaList
}

export function getChapterMeta(slug: string): ChapterMeta | undefined {
  return chapterMetaList.find((c) => c.slug === slug)
}

/** Antal övningsfrågor i alla kapitel. */
export const totalQuestionCount = chapterMetaList.reduce((n, c) => n + c.questionCount, 0)

export const inledningMp3Url = `${UHR}/01_inledning.mp3`
