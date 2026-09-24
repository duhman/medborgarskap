import type { ChapterContent } from '../types'

export const sverigesDemokratiskaSystem: ChapterContent = {
  slug: 'sveriges-demokratiska-system',
  number: 2,
  title: 'Sveriges demokratiska system',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/03_sveriges-demokratiska-system.mp3',
  intro:
    'Sverige är en demokrati där politiken formas genom val och där grundlagar skyddar rättigheter. Här går vi igenom vem som får rösta, hur mandat fördelas och vad som skiljer demokrati från andra styrelsesätt.',
  bullets: [
    'All makt utgår från folket genom fria val.',
    'Grundlagarna sätter ramar för hur staten får agera.',
    'Flera partier tävlar om väljarnas förtroende.',
  ],
  questions: [
    {
      id: 'k2-q1',
      prompt: 'Från vilken ålder får man rösta i riksdagsval i Sverige?',
      options: [
        { id: 'A', text: '16 år' },
        { id: 'B', text: '18 år' },
        { id: 'C', text: '20 år' },
        { id: 'D', text: '21 år' },
      ],
      correctOptionId: 'B',
      explanationSv: 'Rösträtt i riksdagsval och EU-val har 18 år som gräns.',
      explanationEn: 'You must be 18 to vote in national and EU elections.',
      source: { chapter: 2, page: 6 },
    },
    {
      id: 'k2-q2',
      prompt: 'Vad innebär det att Sverige är en representativ demokrati?',
      options: [
        { id: 'A', text: 'Alla lagar beslutas direkt i folkomröstning varje vecka' },
        { id: 'B', text: 'Folket väljer företrädare som fattar beslut å deras vägnar' },
        { id: 'C', text: 'Kungen ensam bestämmer alla lagar' },
        { id: 'D', text: 'Endast riksdagsledamöter får yttra sig offentligt' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'I en representativ demokrati väljer medborgarna folkvalda som representerar dem i riksdag och fullmäktige.',
      explanationEn: 'Citizens elect representatives to decide on their behalf.',
      source: { chapter: 2, page: 4 },
    },
    {
      id: 'k2-q3',
      prompt: 'Vilken grundlag innehåller regler om yttrandefrihet och mötesfrihet?',
      options: [
        { id: 'A', text: 'Regeringsformen' },
        { id: 'B', text: 'Successionsordningen' },
        { id: 'C', text: 'Riksdagsordningen' },
        { id: 'D', text: 'Kommunallagen' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Regeringsformen är en av Sveriges grundlagar och beskriver grundläggande fri- och rättigheter.',
      explanationEn: 'The Instrument of Government is one of Sweden’s fundamental laws.',
      source: { chapter: 2, page: 8 },
    },
    {
      id: 'k2-q4',
      prompt: 'Hur ofta hålls ordinarie riksdagsval i Sverige?',
      options: [
        { id: 'A', text: 'Varje år' },
        { id: 'B', text: 'Var fjärde år' },
        { id: 'C', text: 'Var sjunde år' },
        { id: 'D', text: 'Var tionde år' },
      ],
      correctOptionId: 'B',
      explanationSv: 'Riksdagsval hålls vart fjärde år, vanligtvis i september.',
      explanationEn: 'General elections are held every four years.',
      source: { chapter: 2, page: 10 },
    },
    {
      id: 'k2-q5',
      prompt: 'Vad krävs normalt för att ett parti ska få plats i riksdagen?',
      options: [
        { id: 'A', text: 'Minst 2 procent av rösterna' },
        { id: 'B', text: 'Minst 4 procent av rösterna' },
        { id: 'C', text: 'Minst 10 procent av rösterna' },
        { id: 'D', text: 'Minst 50 mandat direkt' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Spärregeln på 4 procent gäller riksdagsvalet, med undantag om partiet vinner ett valkretsmandat.',
      explanationEn: 'The 4% threshold applies in parliamentary elections.',
      source: { chapter: 2, page: 11 },
    },
    {
      id: 'k2-q6',
      prompt: 'Vem har rösträtt i kommun- och regionval?',
      options: [
        { id: 'A', text: 'Endast svenska medborgare' },
        { id: 'B', text: 'EU-medborgare folkbokförda i kommunen och svenska medborgare' },
        { id: 'C', text: 'Alla som besökt Sverige minst en vecka' },
        { id: 'D', text: 'Endast personer över 21 år' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Svenska medborgare och folkbokförda EU-medborgare får rösta i kommun- och regionval från 18 år.',
      explanationEn: 'Swedish citizens and registered EU citizens may vote in local elections.',
      source: { chapter: 2, page: 7 },
    },
  ],
}
