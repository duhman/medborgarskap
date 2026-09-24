import type { ChapterContent } from '../types'

export const politiskaValOchPartier: ChapterContent = {
  slug: 'politiska-val-och-partier',
  number: 4,
  title: 'Politiska val och partier',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/05_politiska-val-och-partier.mp3',
  intro:
    'Partier samlar människor med gemensamma idéer om hur Sverige ska styras. Här går vi igenom när val hålls, vem som får rösta, hur proportionella val fungerar och vad som skiljer riksdagsval från EU-val.',
  bullets: [
    'Riksdags-, region- och kommunval hålls vart fjärde år.',
    'EU-parlamentsval hålls vart femte år.',
    'Valen är hemliga och proportionella.',
  ],
  questions: [
    {
      id: 'k4-q1',
      prompt: 'Hur ofta hålls val till riksdag, region och kommun i Sverige?',
      options: [
        { id: 'A', text: 'Varje år' },
        { id: 'B', text: 'Var fjärde år' },
        { id: 'C', text: 'Var femte år' },
        { id: 'D', text: 'Var sjunde år' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Val till riksdag, regionfullmäktige och kommunfullmäktige hålls vart fjärde år. EU-valet hålls vart femte år.',
      explanationEn: 'National and local elections are held every four years.',
      source: { chapter: 4, page: 14 },
    },
    {
      id: 'k4-q2',
      prompt: 'Vad innebär att valen i Sverige är proportionella?',
      options: [
        { id: 'A', text: 'Partiet med flest röster får alla mandat' },
        { id: 'B', text: 'Platserna fördelas ungefär efter andelen röster partiet fått' },
        { id: 'C', text: 'Varje kommun får exakt ett mandat i riksdagen' },
        { id: 'D', text: 'Endast de två största partierna får sitta i riksdagen' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Vid proportionella val får partier platser utifrån sin röstandel. Tjugo procent av rösterna ger ungefär tjugo procent av platserna.',
      explanationEn: 'Seats are allocated in proportion to each party’s share of the vote.',
      source: { chapter: 4, page: 15 },
    },
    {
      id: 'k4-q3',
      prompt: 'Hur många procent av rösterna krävs normalt för att ett parti ska komma in i riksdagen?',
      options: [
        { id: 'A', text: '2 procent' },
        { id: 'B', text: '4 procent' },
        { id: 'C', text: '8 procent' },
        { id: 'D', text: '12 procent' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Spärregeln på fyra procent gäller riksdagsvalet och ska hindra att för många små partier gör det svårare att bilda majoritet.',
      explanationEn: 'The four percent threshold applies in parliamentary elections.',
      source: { chapter: 4, page: 15 },
    },
    {
      id: 'k4-q4',
      prompt: 'Vad gällde resultatet i folkomröstningen om euron 2003?',
      options: [
        { id: 'A', text: 'Sverige införde euron direkt' },
        { id: 'B', text: 'Folket röstade nej och Sverige behöll kronan' },
        { id: 'C', text: 'Riksdagen avskaffade folkomröstningen' },
        { id: 'D', text: 'Sverige gick med i eurozonen 2005' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Folkomröstningar är rådgivande. 2003 röstade väljarna nej till att byta svenska kronan mot euro.',
      explanationEn: 'Voters rejected adopting the euro in 2003.',
      source: { chapter: 4, page: 14 },
    },
    {
      id: 'k4-q5',
      prompt: 'Vad krävs utöver att ha fyllt 18 år för att rösta i riksdagsvalet?',
      options: [
        { id: 'A', text: 'Svenskt medborgarskap' },
        { id: 'B', text: 'Minst tre års folkbokföring i Sverige' },
        { id: 'C', text: 'Medlemskap i ett politiskt parti' },
        { id: 'D', text: 'EU-medborgarskap räcker alltid' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Rösträtt kräver 18 år. I riksdagsvalet krävs svenskt medborgarskap. Kommun- och regionval har andra regler för utländska medborgare.',
      explanationEn: 'Parliamentary voters must be Swedish citizens and at least 18.',
      source: { chapter: 4, page: 14 },
    },
    {
      id: 'k4-q6',
      prompt: 'Var röstar EU-medborgare i Sverige till EU-parlamentet?',
      options: [
        { id: 'A', text: 'I sitt hemland oavsett var de bor' },
        { id: 'B', text: 'I det land där de är folkbokförda' },
        { id: 'C', text: 'Endast i Bryssel' },
        { id: 'D', text: 'De får inte rösta i EU-val' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'EU-medborgare röstar till EU-parlamentet i det land där de är folkbokförda, inte automatiskt i hemlandet.',
      explanationEn: 'EU citizens vote for the European Parliament in their country of residence.',
      source: { chapter: 4, page: 14 },
    },
  ],
}
