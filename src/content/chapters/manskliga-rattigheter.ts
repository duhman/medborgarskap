import type { ChapterContent } from '../types'

export const manskligaRattigheter: ChapterContent = {
  slug: 'manskliga-rattigheter',
  number: 7,
  title: 'Mänskliga rättigheter',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/08_manskliga-rattigheter.mp3',
  intro:
    'Mänskliga rättigheter gäller alla och har påverkat svensk lagstiftning. Här tar vi upp FN, diskriminering, jämställdhet, barns rättigheter och skydd för minoriteter.',
  bullets: [
    'FN grundades 1945 och antog deklarationen om mänskliga rättigheter 1948.',
    'Diskrimineringslagen förbjuder särbehandling på flera grunder.',
    'Barnkonventionen är svensk lag sedan 2020.',
  ],
  questions: [
    {
      id: 'k7-q1',
      prompt: 'När grundades Förenta nationerna enligt utbildningsmaterialet?',
      options: [
        { id: 'A', text: '1919' },
        { id: 'B', text: '1945' },
        { id: 'C', text: '1951' },
        { id: 'D', text: '1975' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'FN bildades 1945 efter andra världskriget för att främja fred och skydda mänskliga rättigheter.',
      explanationEn: 'The UN was founded in 1945 after the Second World War.',
      source: { chapter: 7, page: 22 },
    },
    {
      id: 'k7-q2',
      prompt: 'Vad förbjuder diskrimineringslagen i Sverige?',
      options: [
        { id: 'A', text: 'Att arbeta i offentlig sektor' },
        { id: 'B', text: 'Diskriminering på grund av till exempel kön, etnicitet eller funktionsnedsättning' },
        { id: 'C', text: 'Att gå i grundskola' },
        { id: 'D', text: 'Att rösta i kommunval' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Diskrimineringslagen skyddar mot sämre behandling på flera grunder, bland annat kön, ålder och religion.',
      explanationEn: 'The Discrimination Act bans unequal treatment on several grounds.',
      source: { chapter: 7, page: 22 },
    },
    {
      id: 'k7-q3',
      prompt: 'När blev barnkonventionen svensk lag?',
      options: [
        { id: 'A', text: '1989' },
        { id: 'B', text: '2000' },
        { id: 'C', text: '2020' },
        { id: 'D', text: '2024' },
      ],
      correctOptionId: 'C',
      explanationSv: 'Barnkonventionen har varit FN-konvention länge men blev svensk lag 2020.',
      explanationEn: 'The Convention on the Rights of the Child became Swedish law in 2020.',
      source: { chapter: 7, page: 24 },
    },
    {
      id: 'k7-q4',
      prompt: 'Vad säger sexköpslagen i Sverige?',
      options: [
        { id: 'A', text: 'Det är olagligt att sälja sex' },
        { id: 'B', text: 'Det är olagligt att köpa sex, inte att sälja' },
        { id: 'C', text: 'Både köp och försäljning är tillåtna' },
        { id: 'D', text: 'Endast utländska medborgare får straffas' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Lagen riktar straffet mot köparen för att markera att det inte är acceptabelt att köpa sexuella tjänster.',
      explanationEn: 'Buying sex is illegal; selling is not criminalised under this law.',
      source: { chapter: 7, page: 24 },
    },
    {
      id: 'k7-q5',
      prompt: 'Vilket år förbjöd Sverige som första land i världen att slå barn?',
      options: [
        { id: 'A', text: '1951' },
        { id: 'B', text: '1979' },
        { id: 'C', text: '1994' },
        { id: 'D', text: '2003' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Sverige införde förbud mot barnaga 1979. Allt våld mot barn är förbjudet enligt svensk lag och barnkonventionen.',
      explanationEn: 'Sweden banned corporal punishment of children in 1979.',
      source: { chapter: 7, page: 25 },
    },
    {
      id: 'k7-q6',
      prompt: 'Vilka grupper erkändes som nationella minoriteter i Sverige år 2000?',
      options: [
        { id: 'A', text: 'Endast samer' },
        { id: 'B', text: 'Judar, romer, samer, sverigefinnar och tornedalingar' },
        { id: 'C', text: 'Alla invandrare från EU' },
        { id: 'D', text: 'Endast religiösa samfund' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Sverige erkände fem nationella minoriteter 2000 och har särskilt skydd för deras språk och kultur.',
      explanationEn: 'Five national minorities were recognised in Sweden in 2000.',
      source: { chapter: 7, page: 25 },
    },
  ],
}
