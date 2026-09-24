import type { ChapterContent } from '../types'

export const landetSverige: ChapterContent = {
  slug: 'landet-sverige',
  number: 1,
  title: 'Landet Sverige',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/02_landet-sverige.mp3',
  intro:
    'Sverige ligger i Norden och har en lång kust mot Östersjön. Landet är stort till ytan men glesbefolkat, med stora skogar, sjöar och fjäll. Här lär du dig om landskap, naturresurser, befolkning och hur Sverige hänger ihop geografiskt.',
  bullets: [
    'Sverige har 25 landskap och 21 län.',
    'Skog och vatten har format både natur och näringsliv.',
    'Befolkningen är koncentrerad till södra och mellersta delarna.',
  ],
  questions: [
    {
      id: 'k1-q1',
      prompt: 'Vilket hav ligger längs Sveriges västkust?',
      options: [
        { id: 'A', text: 'Östersjön' },
        { id: 'B', text: 'Nordsjön' },
        { id: 'C', text: 'Kattegatt och Skagerrak' },
        { id: 'D', text: 'Atlanten' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Sveriges västkust vetter mot Kattegatt och Skagerrak, som förbinder Östersjön med Nordsjön.',
      explanationEn: 'Sweden’s west coast faces the Kattegat and Skagerrak.',
      source: { chapter: 1, page: 8 },
    },
    {
      id: 'k1-q2',
      prompt: 'Vilken naturresurs har historiskt haft stor betydelse för Sveriges ekonomi?',
      options: [
        { id: 'A', text: 'Olja' },
        { id: 'B', text: 'Skog' },
        { id: 'C', text: 'Kol' },
        { id: 'D', text: 'Guld' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Skogen har länge varit central för export, industri och sysselsättning i Sverige.',
      explanationEn: 'Forests have long been central to Sweden’s economy.',
      source: { chapter: 1, page: 14 },
    },
    {
      id: 'k1-q3',
      prompt: 'Hur många län finns det i Sverige?',
      options: [
        { id: 'A', text: '13' },
        { id: 'B', text: '21' },
        { id: 'C', text: '25' },
        { id: 'D', text: '290' },
      ],
      correctOptionId: 'B',
      explanationSv: 'Sverige är indelat i 21 län. 25 landskap är en äldre historisk indelning.',
      explanationEn: 'Sweden has 21 counties (län).',
      source: { chapter: 1, page: 10 },
    },
    {
      id: 'k1-q4',
      prompt: 'Vilket land gränsar till Sverige i öster?',
      options: [
        { id: 'A', text: 'Norge' },
        { id: 'B', text: 'Danmark' },
        { id: 'C', text: 'Finland' },
        { id: 'D', text: 'Tyskland' },
      ],
      correctOptionId: 'C',
      explanationSv: 'Sverige gränsar till Norge och Finland. Danmark nås via Öresundsbron.',
      explanationEn: 'Sweden borders Norway and Finland.',
      source: { chapter: 1, page: 9 },
    },
    {
      id: 'k1-q5',
      prompt: 'Vad kallas den norra delen av Sverige med fjäll och gles befolkning?',
      options: [
        { id: 'A', text: 'Götaland' },
        { id: 'B', text: 'Svealand' },
        { id: 'C', text: 'Norrland' },
        { id: 'D', text: 'Skåne' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Norrland omfattar ungefär de norra tre femtedelarna av landet och har relativt få invånare per kvadratkilometer.',
      explanationEn: 'Norrland covers much of northern Sweden.',
      source: { chapter: 1, page: 11 },
    },
    {
      id: 'k1-q6',
      prompt: 'Vilket av följande är Sveriges huvudstad?',
      options: [
        { id: 'A', text: 'Göteborg' },
        { id: 'B', text: 'Malmö' },
        { id: 'C', text: 'Stockholm' },
        { id: 'D', text: 'Uppsala' },
      ],
      correctOptionId: 'C',
      explanationSv: 'Stockholm är Sveriges huvudstad och säte för riksdag och regering.',
      explanationEn: 'Stockholm is the capital of Sweden.',
      source: { chapter: 1, page: 12 },
    },
  ],
}
