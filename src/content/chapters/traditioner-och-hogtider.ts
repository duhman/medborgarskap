import type { ChapterContent } from '../types'

export const traditionerOchHogtider: ChapterContent = {
  slug: 'traditioner-och-hogtider',
  number: 13,
  title: 'Traditioner och högtider',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/14_traditioner-och-hogtider.mp3',
  intro:
    'Högtider och traditioner förbinder generationer. Många firas fortfarande i Sverige, ofta med kristna rötter men också med nya inslag från invandring och secularisering.',
  bullets: [
    'Jul, påsk och pingst har kristna rötter men firas ofta som kultur.',
    'Nationaldagen är den 6 juni och blev helgdag 2005.',
    'Midsommar, lucia och valborg markerar årets växlingar.',
  ],
  questions: [
    {
      id: 'k13-q1',
      prompt: 'När firas julafton i Sverige?',
      options: [
        { id: 'A', text: '24 december' },
        { id: 'B', text: '25 december' },
        { id: 'C', text: '31 december' },
        { id: 'D', text: '6 juni' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Julafton den 24 december är huvuddagen när familjer samlas, äter julmat och delar ut julklappar.',
      explanationEn: 'Christmas Eve is celebrated on 24 December in Sweden.',
      source: { chapter: 13, page: 47 },
    },
    {
      id: 'k13-q2',
      prompt: 'Vilken dag är Sveriges nationaldag?',
      options: [
        { id: 'A', text: '1 maj' },
        { id: 'B', text: '6 juni' },
        { id: 'C', text: '30 april' },
        { id: 'D', text: '13 december' },
      ],
      correctOptionId: 'B',
      explanationSv:
        '6 juni är nationaldag och helgdag sedan 2005, med flagghissning och ofta medborgarskapsceremonier.',
      explanationEn: 'Sweden’s National Day is 6 June.',
      source: { chapter: 13, page: 46 },
    },
    {
      id: 'k13-q3',
      prompt: 'Vad firas på valborgsmässoafton den 30 april?',
      options: [
        { id: 'A', text: 'Hösten' },
        { id: 'B', text: 'Våren' },
        { id: 'C', text: 'Nyår' },
        { id: 'D', text: 'Nationaldagen' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Valborgsmässoafton välkomnar våren med brasor, sånger och tal.',
      explanationEn: 'Walpurgis Night welcomes spring on 30 April.',
      source: { chapter: 13, page: 46 },
    },
    {
      id: 'k13-q4',
      prompt: 'När firas lucia enligt traditionen i materialet?',
      options: [
        { id: 'A', text: '6 juni' },
        { id: 'B', text: '13 december' },
        { id: 'C', text: '24 december' },
        { id: 'D', text: '30 april' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Lucia firas den 13 december med luciatåg, ljus och lussebullar när det är mörkt på året.',
      explanationEn: 'Lucia is celebrated on 13 December.',
      source: { chapter: 13, page: 47 },
    },
    {
      id: 'k13-q5',
      prompt: 'Vad är typisk mat på midsommar enligt kapitlet?',
      options: [
        { id: 'A', text: 'Sill, färskpotatis och jordgubbar' },
        { id: 'B', text: 'Endast pizza' },
        { id: 'C', text: 'Bara julskinka' },
        { id: 'D', text: 'Endast fisk från Norge' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Midsommar firas med dans kring stång, blomsterkransar och traditionell sommarmat som sill och potatis.',
      explanationEn: 'Midsummer food often includes herring, new potatoes and strawberries.',
      source: { chapter: 13, page: 46 },
    },
    {
      id: 'k13-q6',
      prompt: 'Vad uppmärksammas särskilt på första maj i Sverige?',
      options: [
        { id: 'A', text: 'Arbetarnas dag med demonstrationer' },
        { id: 'B', text: 'Kungens födelsedag' },
        { id: 'C', text: 'EU-valet' },
        { id: 'D', text: 'Skolstart' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Första maj är helgdag och arbetarrörelsen arrangerar demonstrationer om sociala och politiska frågor.',
      explanationEn: 'May Day is Labour Day with demonstrations across Sweden.',
      source: { chapter: 13, page: 46 },
    },
  ],
}
