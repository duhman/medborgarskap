import type { ChapterContent } from '../types'

export const saHarStyrsSverige: ChapterContent = {
  slug: 'sa-har-styrs-sverige',
  number: 3,
  title: 'Så här styrs Sverige',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/04_sa-har-styrs-sverige.mp3',
  intro:
    'Sverige styrs på flera nivåer: riksdag och regering på nationell nivå, regioner och kommuner lokalt, plus samarbete inom EU. Här får du en överblick över vem som gör vad.',
  bullets: [
    'Riksdagen stiftar lagar och beslutar om budget.',
    'Regeringen leder förvaltningen och genomför riksdagens beslut.',
    'Kommuner ansvarar för skola, omsorg och mycket av vardagen nära invånarna.',
  ],
  questions: [
    {
      id: 'k3-q1',
      prompt: 'Vilken titel har Sveriges statschef?',
      options: [
        { id: 'A', text: 'Talman' },
        { id: 'B', text: 'Kung' },
        { id: 'C', text: 'Landshövding' },
        { id: 'D', text: 'Statsminister' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Kungen är statschef men utövar inte politisk makt. Statsministern leder regeringen.',
      explanationEn: 'The monarch is head of state; the prime minister leads government.',
      source: { chapter: 3, page: 5 },
    },
    {
      id: 'k3-q2',
      prompt: 'Vem utser statsministern?',
      options: [
        { id: 'A', text: 'Kungen, utan inblandning av riksdagen' },
        { id: 'B', text: 'Riksdagen' },
        { id: 'C', text: 'EU-kommissionen' },
        { id: 'D', text: 'Kommunfullmäktige i Stockholm' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Riksdagen väljer statsminister. Kungen utser sedan statsministern enligt riksdagens beslut.',
      explanationEn: 'Parliament elects the prime minister.',
      source: { chapter: 3, page: 6 },
    },
    {
      id: 'k3-q3',
      prompt: 'Vad är riksdagens viktigaste uppgifter?',
      options: [
        { id: 'A', text: 'Döma i brottmål och tvistemål' },
        { id: 'B', text: 'Stifta lagar och besluta om statens budget' },
        { id: 'C', text: 'Driva kommunala skolor' },
        { id: 'D', text: 'Utse landshövdingar i varje kommun' },
      ],
      correctOptionId: 'B',
      explanationSv: 'Riksdagen lagstiftar, godkänner budget och kontrollerar regeringen.',
      explanationEn: 'Parliament legislates, approves the budget, and scrutinises government.',
      source: { chapter: 3, page: 8 },
    },
    {
      id: 'k3-q4',
      prompt: 'Vilken nivå ansvarar främst för förskola och grundskola?',
      options: [
        { id: 'A', text: 'Riksdagen' },
        { id: 'B', text: 'Regionen' },
        { id: 'C', text: 'Kommunen' },
        { id: 'D', text: 'EU' },
      ],
      correctOptionId: 'C',
      explanationSv: 'Kommuner ansvarar för förskola och grundskola, medan staten sätter ramar.',
      explanationEn: 'Municipalities run preschool and compulsory school.',
      source: { chapter: 3, page: 14 },
    },
    {
      id: 'k3-q5',
      prompt: 'Vad gör regionerna (landstingen) i huvudsak?',
      options: [
        { id: 'A', text: 'Sköter gatuunderhåll och snöröjning i varje stad' },
        { id: 'B', text: 'Ansvarar för hälso- och sjukvård i regionen' },
        { id: 'C', text: 'Förvaltar utrikespolitiken' },
        { id: 'D', text: 'Utser riksdagens talman' },
      ],
      correctOptionId: 'B',
      explanationSv: 'Regionerna ansvarar för sjukvård och regional utveckling, med valda politiker.',
      explanationEn: 'Regions handle health care and regional development.',
      source: { chapter: 3, page: 15 },
    },
    {
      id: 'k3-q6',
      prompt: 'Hur blir EU-lagar bindande i Sverige?',
      options: [
        { id: 'A', text: 'De gäller direkt utan att riksdagen gör något' },
        { id: 'B', text: 'Riksdagen måste alltid skriva om hela grundlagen först' },
        { id: 'C', text: 'Endast om kungen skriver under varje förordning' },
        { id: 'D', text: 'De gäller bara i Stockholm' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Vissa EU-rättsakter är direkt tillämpliga. Andra kräver att Sverige inför dem i svensk lag.',
      explanationEn: 'Some EU acts apply directly; others must be transposed into Swedish law.',
      source: { chapter: 3, page: 18 },
    },
  ],
}
