import type { ChapterContent } from '../types'

export const enSekularStatOchEttMangreligiostLand: ChapterContent = {
  slug: 'en-sekular-stat-och-ett-mangreligiost-land',
  number: 12,
  title: 'En sekulär stat och ett mångreligiöst land',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/13_en-sekular-stat-och-ett-mangreligiost-land_uppdaterat-ljud-260811.mp3',
  intro:
    'Sverige är en sekulär stat med religionsfrihet och ett brett spektrum av trosriktningar. Här går vi igenom kyrka och stat, lagar om religionsfrihet och hur religioner växt i landet.',
  bullets: [
    'Staten är religiöst neutral och får inte diskriminera trosuppfattning.',
    'Religionsfrihetslagen 1951 gav full frihet att välja eller avstå religion.',
    'Svenska kyrkan skildes från staten år 2000.',
  ],
  questions: [
    {
      id: 'k12-q1',
      prompt: 'Vad innebär att Sverige är en sekulär stat?',
      options: [
        { id: 'A', text: 'Staten ska tvinga alla att tillhöra Svenska kyrkan' },
        { id: 'B', text: 'Staten är religiöst neutral och garanterar religionsfrihet' },
        { id: 'C', text: 'Endast kristna får vara medborgare' },
        { id: 'D', text: 'Religion får inte utövas privat' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'En sekulär stat tar inte ställning för en religion utan skyddar rätten att tro eller inte tro.',
      explanationEn: 'A secular state is religiously neutral and protects freedom of religion.',
      source: { chapter: 12, page: 42 },
    },
    {
      id: 'k12-q2',
      prompt: 'Vilket år infördes religionsfrihetslagen som gav full frihet att välja religion?',
      options: [
        { id: 'A', text: '1860' },
        { id: 'B', text: '1951' },
        { id: 'C', text: '2000' },
        { id: 'D', text: '2010' },
      ],
      correctOptionId: 'B',
      explanationSv:
        '1951 kunde man för första gången helt fritt välja religion eller leva utan religiös tillhörighet.',
      explanationEn: 'The Freedom of Religion Act entered into force in 1951.',
      source: { chapter: 12, page: 42 },
    },
    {
      id: 'k12-q3',
      prompt: 'När skildes Svenska kyrkan från staten?',
      options: [
        { id: 'A', text: '1523' },
        { id: 'B', text: '1951' },
        { id: 'C', text: '2000' },
        { id: 'D', text: '2024' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'År 2000 blev Svenska kyrkan ett trossamfund bland andra, även om den fortfarande är störst.',
      explanationEn: 'Church and state were separated in 2000.',
      source: { chapter: 12, page: 42 },
    },
    {
      id: 'k12-q4',
      prompt: 'Ungefär hur många medeltida kyrkor och kyrkoruin finns kvar enligt materialet?',
      options: [
        { id: 'A', text: 'Cirka 140' },
        { id: 'B', text: 'Cirka 1 400' },
        { id: 'C', text: 'Cirka 14 000' },
        { id: 'D', text: 'Cirka 140 000' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Materialet nämner cirka 1 400 bevarade kyrkor och ruiner med medeltida ursprung, ett känt UHR-exempel.',
      explanationEn: 'The material cites roughly 1,400 medieval churches and ruins.',
      source: { chapter: 12, page: 43 },
    },
    {
      id: 'k12-q5',
      prompt: 'Vilken religion är näst störst i Sverige enligt kapitlet?',
      options: [
        { id: 'A', text: 'Islam' },
        { id: 'B', text: 'Hinduism' },
        { id: 'C', text: 'Buddhism' },
        { id: 'D', text: 'Judendom' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Kristendomen dominerar historiskt, men islam har vuxit och är enligt materialet näst störst idag.',
      explanationEn: 'Islam is described as the second largest religion in Sweden today.',
      source: { chapter: 12, page: 44 },
    },
    {
      id: 'k12-q6',
      prompt: 'Vad ska religionskunskap i skolan ge eleverna?',
      options: [
        { id: 'A', text: 'Bara kunskap om en enda religion' },
        { id: 'B', text: 'Förståelse för olika religioner och livsåskådningar' },
        { id: 'C', text: 'Obligatorisk kyrkogång varje vecka' },
        { id: 'D', text: 'Undantag från alla andra ämnen' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Undervisningen ska ge bred kunskap och främja tolerans och respekt för olikheter.',
      explanationEn: 'Religious education should build understanding of many worldviews.',
      source: { chapter: 12, page: 42 },
    },
  ],
}
