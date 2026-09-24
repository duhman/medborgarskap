import type { ChapterContent } from '../types'

export const valfardssamhallet: ChapterContent = {
  slug: 'valfardssamhallet',
  number: 9,
  title: 'Välfärdssamhället',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/10_valfardssamhallet.mp3',
  intro:
    'Välfärdssamhället ska ge ekonomisk och social trygghet. Skatter finansierar skola, sjukvård och stöd när livet förändras. Stat, regioner och kommuner har olika ansvar.',
  bullets: [
    'Skatter finansierar gemensamma tjänster som skola och sjukvård.',
    'Regionerna ansvarar för hälso- och sjukvård.',
    'Kommunerna driver förskola, skola och äldreomsorg.',
  ],
  questions: [
    {
      id: 'k9-q1',
      prompt: 'Vad betalas moms på?',
      options: [
        { id: 'A', text: 'Endast bostäder' },
        { id: 'B', text: 'Varor och tjänster som köps och säljs' },
        { id: 'C', text: 'Endast löner till politiker' },
        { id: 'D', text: 'Endast import från USA' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Moms (mervärdesskatt) är en skatt på varor och tjänster och bidrar till välfärdens finansiering.',
      explanationEn: 'VAT is charged on goods and services.',
      source: { chapter: 9, page: 30 },
    },
    {
      id: 'k9-q2',
      prompt: 'Vem ansvarar främst för hälso- och sjukvård i Sverige?',
      options: [
        { id: 'A', text: 'Kommunerna' },
        { id: 'B', text: 'Regionerna' },
        { id: 'C', text: 'Kungen' },
        { id: 'D', text: 'FN' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Regionerna driver sjukhus och vårdcentraler och finansieras bland annat genom regionskatt.',
      explanationEn: 'Regions are responsible for health care.',
      source: { chapter: 9, page: 30 },
    },
    {
      id: 'k9-q3',
      prompt: 'Vilken nivå ansvarar för grundskola och förskola enligt materialet?',
      options: [
        { id: 'A', text: 'Staten ensam' },
        { id: 'B', text: 'Kommunen' },
        { id: 'C', text: 'EU' },
        { id: 'D', text: 'Försvarsmakten' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Kommunerna ska erbjuda förskola, grundskola och annan kommunal välfärd som äldreomsorg.',
      explanationEn: 'Municipalities provide preschool and compulsory school.',
      source: { chapter: 9, page: 31 },
    },
    {
      id: 'k9-q4',
      prompt: 'Vad finansierar staten bland annat enligt kapitlet?',
      options: [
        { id: 'A', text: 'Gatustädning i varje gata' },
        { id: 'B', text: 'Pensioner, studiestöd och föräldraförsäkring' },
        { id: 'C', text: 'All sjukhusvård direkt utan regioner' },
        { id: 'D', text: 'Endast kungens privata hushåll' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Staten finansierar exempelvis pensioner, sjukförsäkring, arbetslöshetsförsäkring, studiestöd och barnbidrag.',
      explanationEn: 'The state funds pensions, parental leave insurance and student aid among other things.',
      source: { chapter: 9, page: 30 },
    },
    {
      id: 'k9-q5',
      prompt: 'Vad kallas skatt som betalas på lönen?',
      options: [
        { id: 'A', text: 'Moms' },
        { id: 'B', text: 'Inkomstskatt' },
        { id: 'C', text: 'Tull' },
        { id: 'D', text: 'Fastighetsskatt till EU' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Inkomstskatt går till stat, region och kommun. Arbetsgivare betalar också arbetsgivaravgifter.',
      explanationEn: 'Income tax is deducted from wages.',
      source: { chapter: 9, page: 30 },
    },
    {
      id: 'k9-q6',
      prompt: 'Vad ska välfärdssamhället ge invånarna enligt inledningen?',
      options: [
        { id: 'A', text: 'Gratis bilar till alla' },
        { id: 'B', text: 'Grundläggande ekonomisk och social trygghet' },
        { id: 'C', text: 'Garanti för samma lön i alla jobb' },
        { id: 'D', text: 'Undantag från alla lagar' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Välfärdssamhället ska ge trygghet genom tillgång till sjukvård, utbildning och stöd vid exempelvis sjukdom.',
      explanationEn: 'The welfare state aims at basic economic and social security.',
      source: { chapter: 9, page: 30 },
    },
  ],
}
