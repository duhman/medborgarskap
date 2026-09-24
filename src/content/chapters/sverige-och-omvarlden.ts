import type { ChapterContent } from '../types'

export const sverigeOchOmvarlden: ChapterContent = {
  slug: 'sverige-och-omvarlden',
  number: 11,
  title: 'Sverige och omvärlden',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/12_sverige-och-omvarlden_uppdaterat-ljud-260811.mp3',
  intro:
    'Sverige samarbetar nordiskt, europeiskt och globalt. Kapitlet tar upp EU, FN, bistånd via Sida samt försvar, totalförsvar och Sveriges medlemskap i NATO.',
  bullets: [
    'Sverige är medlem i EU sedan 1995 och i FN sedan 1945.',
    'Nordiska rådet samordnar samarbete med grannländerna.',
    'Totalförsvaret omfattar både militärt och civilt försvar.',
  ],
  questions: [
    {
      id: 'k11-q1',
      prompt: 'När blev Sverige medlem i EU?',
      options: [
        { id: 'A', text: '1973' },
        { id: 'B', text: '1995' },
        { id: 'C', text: '2004' },
        { id: 'D', text: '2020' },
      ],
      correctOptionId: 'B',
      explanationSv: 'Sverige gick med i EU 1995 efter folkomröstning och förhandlingar.',
      explanationEn: 'Sweden joined the EU in 1995.',
      source: { chapter: 11, page: 39 },
    },
    {
      id: 'k11-q2',
      prompt: 'Vad kallas rätten att studera, arbeta och sälja varor inom EU?',
      options: [
        { id: 'A', text: 'Allemansrätten' },
        { id: 'B', text: 'De fyra friheterna' },
        { id: 'C', text: 'Public service' },
        { id: 'D', text: 'Folkhemmet' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'EU bygger bland annat på fri rörlighet för personer, varor, tjänster och kapital.',
      explanationEn: 'The four freedoms underpin EU internal market rules.',
      source: { chapter: 11, page: 39 },
    },
    {
      id: 'k11-q3',
      prompt: 'Vilket år grundades FN enligt utbildningsmaterialet?',
      options: [
        { id: 'A', text: '1919' },
        { id: 'B', text: '1945' },
        { id: 'C', text: '1949' },
        { id: 'D', text: '1991' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'FN grundades 1945 efter andra världskriget. Sverige är medlem och stödjer fred och mänskliga rättigheter.',
      explanationEn: 'The UN was founded in 1945.',
      source: { chapter: 11, page: 39 },
    },
    {
      id: 'k11-q4',
      prompt: 'När blev Sverige medlem i NATO enligt materialet?',
      options: [
        { id: 'A', text: '1949' },
        { id: 'B', text: '1995' },
        { id: 'C', text: '2022' },
        { id: 'D', text: '2024' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Efter Rysslands angrepp på Ukraina ansökte Sverige om NATO-medlemskap och blev medlem 2024.',
      explanationEn: 'Sweden joined NATO in 2024.',
      source: { chapter: 11, page: 40 },
    },
    {
      id: 'k11-q5',
      prompt: 'Vad omfattar totalförsvarsplikten?',
      options: [
        { id: 'A', text: 'Endast barn under 10 år' },
        { id: 'B', text: 'Alla mellan 16 och 70 år kan kallas att hjälpa till att försvara landet' },
        { id: 'C', text: 'Endast EU-medborgare' },
        { id: 'D', text: 'Bara riksdagsledamöter' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Totalförsvarsplikten innebär att personer 16-70 år kan behöva bidra till försvaret vid krig eller kris.',
      explanationEn: 'Total defence duty can apply to residents aged 16 to 70.',
      source: { chapter: 11, page: 40 },
    },
    {
      id: 'k11-q6',
      prompt: 'Vilken myndighet driver svenskt bistånd och utvecklingssamarbete?',
      options: [
        { id: 'A', text: 'Sida' },
        { id: 'B', text: 'Skatteverket' },
        { id: 'C', text: 'Arbetsförmedlingen' },
        { id: 'D', text: 'Kronofogden' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Sida arbetar för att minska fattigdom och stödja demokrati och hållbar utveckling i partnerländer.',
      explanationEn: 'Sida manages Swedish international development cooperation.',
      source: { chapter: 11, page: 39 },
    },
  ],
}
