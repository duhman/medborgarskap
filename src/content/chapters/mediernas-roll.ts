import type { ChapterContent } from '../types'

export const mediernasRoll: ChapterContent = {
  slug: 'mediernas-roll',
  number: 6,
  title: 'Mediernas roll',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/07_mediernas-roll.mp3',
  intro:
    'Medier sprider nyheter, underhållning och debatt. I Sverige skyddas pressfriheten i grundlagarna och journalister granskar makthavare med stöd av offentlighetsprincipen.',
  bullets: [
    'Tryck- och yttrandefrihet skyddas i grundlagarna.',
    'Public service finansieras via skatten utan reklam.',
    'Källkritik behövs särskilt på webben och i sociala medier.',
  ],
  questions: [
    {
      id: 'k6-q1',
      prompt: 'Vilka grundlagar skyddar fria medier i Sverige?',
      options: [
        { id: 'A', text: 'Kommunallagen och skollagen' },
        { id: 'B', text: 'Tryckfrihetsförordningen och yttrandefrihetsgrundlagen' },
        { id: 'C', text: 'Successionsordningen och regeringsformen' },
        { id: 'D', text: 'Endast EU-förordningar' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Tryckfrihetsförordningen gäller tryckt media och yttrandefrihetsgrundlagen radio, tv och liknande medier.',
      explanationEn: 'Freedom of the press and expression are protected in two fundamental laws.',
      source: { chapter: 6, page: 20 },
    },
    {
      id: 'k6-q2',
      prompt: 'Vad innebär offentlighetsprincipen för journalister?',
      options: [
        { id: 'A', text: 'Alla myndighetshandlingar är alltid hemliga' },
        { id: 'B', text: 'Allmänna handlingar hos myndigheter kan begäras ut om de inte omfattas av sekretess' },
        { id: 'C', text: 'Endast riksdagsledamöter får läsa myndighetsmail' },
        { id: 'D', text: 'Staten bestämmer i förväg vilka nyheter som får publiceras' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Offentlighetsprincipen gör att journalister kan granska hur myndigheter fattat beslut genom att begära ut handlingar.',
      explanationEn: 'Public access to official documents supports scrutiny of government.',
      source: { chapter: 6, page: 20 },
    },
    {
      id: 'k6-q3',
      prompt: 'Vilka tre organisationer kallas public service i Sverige?',
      options: [
        { id: 'A', text: 'SR, SVT och UR' },
        { id: 'B', text: 'TT, TV4 och Spotify' },
        { id: 'C', text: 'Skolverket, UR och SVT' },
        { id: 'D', text: 'Riksdagen, SR och SVT' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Sveriges Radio, Sveriges Television och Utbildningsradion ska vara oberoende och finansieras via public service-avgiften.',
      explanationEn: 'Public service consists of SR, SVT and UR.',
      source: { chapter: 6, page: 21 },
    },
    {
      id: 'k6-q4',
      prompt: 'Hur finansieras public service-bolagen?',
      options: [
        { id: 'A', text: 'Genom reklam i alla program' },
        { id: 'B', text: 'Genom avgift via skattesystemet' },
        { id: 'C', text: 'Endast genom prenumerationer' },
        { id: 'D', text: 'Genom partibidrag' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Public service får inte tjäna pengar på reklam utan finansieras via en avgift som tas ut via skatten.',
      explanationEn: 'Public service is funded through a tax-based fee, not advertising.',
      source: { chapter: 6, page: 21 },
    },
    {
      id: 'k6-q5',
      prompt: 'Vad menas med källkritik?',
      options: [
        { id: 'A', text: 'Att alltid lita på det första man läser online' },
        { id: 'B', text: 'Att kontrollera och ifrågasätta om informationen stämmer' },
        { id: 'C', text: 'Att endast läsa officiella partiprogram' },
        { id: 'D', text: 'Att sluta använda sociala medier' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Källkritik innebär att granska vem som står bakom uppgifter och om de kan verifieras, särskilt på webben.',
      explanationEn: 'Source criticism means checking whether information is reliable.',
      source: { chapter: 6, page: 21 },
    },
    {
      id: 'k6-q6',
      prompt: 'Vem är juridiskt ansvarig för innehållet i en tidning?',
      options: [
        { id: 'A', text: 'Varje läsare' },
        { id: 'B', text: 'Den ansvarige utgivaren' },
        { id: 'C', text: 'Riksdagens talman' },
        { id: 'D', text: 'EU-kommissionen' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Ansvarig utgivare ska se till att publicerat material följer lagar om till exempel förtal och hets.',
      explanationEn: 'The responsible publisher is legally accountable for published content.',
      source: { chapter: 6, page: 20 },
    },
  ],
}
