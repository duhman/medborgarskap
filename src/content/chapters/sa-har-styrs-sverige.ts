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
      prompt: 'Vad innebär det att Sverige är en konstitutionell monarki?',
      options: [
        { id: 'A', text: 'Kungen leder regeringen och stiftar lagarna' },
        { id: 'B', text: 'Riksdagen väljer en ny kung vart fjärde år' },
        { id: 'C', text: 'Statschefen är en kung eller drottning som inte har någon politisk makt' },
        { id: 'D', text: 'Kungen är ordförande i riksdagen' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Statschefen är en kung eller drottning utan politisk makt. Kungen är en symbol för Sverige och gör statsbesök. Statsministern leder regeringen.',
      explanationEn:
        'The head of state is a king or queen with no political power. The prime minister leads the government.',
      source: { chapter: 3, page: 13 },
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
        'Riksdagen väljer statsminister, som får i uppdrag att bilda regering. Statsministern väljer sedan ministrarna. Kungen deltar inte i beslutet.',
      explanationEn: 'Parliament elects the prime minister.',
      source: { chapter: 3, page: 12 },
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
      source: { chapter: 3, page: 12 },
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
      source: { chapter: 3, page: 13 },
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
      source: { chapter: 3, page: 13 },
    },
    {
      id: 'k3-q6',
      prompt: 'Hur påverkar EU hur Sverige styrs?',
      options: [
        { id: 'A', text: 'EU-länderna fattar gemensamma beslut och tar fram lagar som gäller i alla medlemsländer' },
        { id: 'B', text: 'EU utser Sveriges statsminister' },
        { id: 'C', text: 'EU:s lagar gäller bara i Bryssel' },
        { id: 'D', text: 'EU bestämmer kommunalskatten i varje kommun' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Utöver stat, regioner och kommuner påverkas Sverige av beslut i EU. EU-länderna fattar gemensamma beslut och tar fram lagar som gäller i alla medlemsländer.',
      explanationEn: 'EU member states make joint decisions and adopt laws that apply in all member states.',
      source: { chapter: 11, page: 39 },
    },
  ],
}
