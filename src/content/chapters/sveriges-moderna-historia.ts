import type { ChapterContent } from '../types'

export const sverigesModernaHistoria: ChapterContent = {
  slug: 'sveriges-moderna-historia',
  number: 10,
  title: 'Sveriges moderna historia',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/11_sveriges-moderna-historia.mp3',
  intro:
    'På tvåhundra år har Sverige gått från jordbruksland till industrisamhälle och välfärdsstat. Här följer demokratins genombrott, folkhemmet, rekordåren och förändringar under senare decennier.',
  bullets: [
    'Allmän och lika rösträtt för kvinnor och män infördes 1921.',
    'Saltsjöbadsavtalet 1938 lade grunden för den svenska modellen.',
    'Efter kriget växte välfärden kraftigt under rekordåren.',
  ],
  questions: [
    {
      id: 'k10-q1',
      prompt: 'Vilket år fick både kvinnor och män rösta i riksdagsval för första gången?',
      options: [
        { id: 'A', text: '1865' },
        { id: 'B', text: '1919' },
        { id: 'C', text: '1921' },
        { id: 'D', text: '1971' },
      ],
      correctOptionId: 'C',
      explanationSv:
        '1921 hölls det första riksdagsvalet där kvinnor kunde rösta och bli valda, vilket markerade demokratins genombrott.',
      explanationEn: 'Women gained full voting rights in parliamentary elections in 1921.',
      source: { chapter: 10, page: 34 },
    },
    {
      id: 'k10-q2',
      prompt: 'Vad är Saltsjöbadsavtalet känt för?',
      options: [
        { id: 'A', text: 'Att Sverige gick med i NATO' },
        { id: 'B', text: 'Samarbete mellan arbetsgivare och fack om arbetsmarknadsfrågor' },
        { id: 'C', text: 'Att kungen fick absolut makt' },
        { id: 'D', text: 'Införande av euron' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Avtalet 1938 mellan SAF och LO blev grunden för den svenska modellen med kollektivavtal i stället för politisk styrning av varje lönefråga.',
      explanationEn: 'The 1938 Saltsjöbaden Agreement underpins labour-market cooperation.',
      source: { chapter: 10, page: 35 },
    },
    {
      id: 'k10-q3',
      prompt: 'Vem formulerade idén om folkhemmet?',
      options: [
        { id: 'A', text: 'Gustav Vasa' },
        { id: 'B', text: 'Per Albin Hansson' },
        { id: 'C', text: 'Olof Palme' },
        { id: 'D', text: 'Carl XVI Gustaf' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Per Albin Hansson beskrev 1928 folkhemmet som ett samhälle där alla ska känna trygghet och gemenskap.',
      explanationEn: 'Per Albin Hansson coined the folkhem idea in 1928.',
      source: { chapter: 10, page: 35 },
    },
    {
      id: 'k10-q4',
      prompt: 'Hur förhöll sig Sverige till första världskriget?',
      options: [
        { id: 'A', text: 'Sverige deltog aktivt på tyska sidan' },
        { id: 'B', text: 'Sverige förklarade sig neutralt' },
        { id: 'C', text: 'Sverige ockuperades av Frankrike' },
        { id: 'D', text: 'Sverige lämnade Norden' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Sverige var neutralt under första världskriget men drabbades ändå av brist på mat och andra varor.',
      explanationEn: 'Sweden declared neutrality during the First World War.',
      source: { chapter: 10, page: 34 },
    },
    {
      id: 'k10-q5',
      prompt: 'Vad kallas perioden med stark tillväxt och stora reformer efter andra världskriget?',
      options: [
        { id: 'A', text: 'Rekordåren' },
        { id: 'B', text: 'Medeltiden' },
        { id: 'C', text: 'Stenåldern' },
        { id: 'D', text: 'Kalmarunionen' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Rekordåren präglades av låg arbetslöshet, hög tillväxt och utbyggd välfärd, ofta med Socialdemokraterna i regeringsställning.',
      explanationEn: 'The post-war decades are often called the record years.',
      source: { chapter: 10, page: 36 },
    },
    {
      id: 'k10-q6',
      prompt: 'Vad innebar du-reformen på 1960-talet?',
      options: [
        { id: 'A', text: 'Att man måste säga "ni" till alla' },
        { id: 'B', text: 'Att man började tuta varandra oftare med "du"' },
        { id: 'C', text: 'Att kungen abdikerade' },
        { id: 'D', text: 'Att skolplikten avskaffades' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Du-reformen speglade ett mer jämlikt samhälle där titlar och "ni" ersattes av "du" i vardagsspråk.',
      explanationEn: 'The du reform made informal address more common.',
      source: { chapter: 10, page: 37 },
    },
  ],
}
