import type { ChapterContent } from '../types'

export const arbetsmarknadOchPrivatekonomi: ChapterContent = {
  slug: 'arbetsmarknad-och-privatekonomi',
  number: 8,
  title: 'Arbetsmarknad och privatekonomi',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/09_arbetsmarknad-och-privatekonomi.mp3',
  intro:
    'De flesta vuxna försörjer sig genom arbete. Kapitlet beskriver offentlig och privat sektor, fack och arbetsgivare, skatt på lön samt grunderna i privatekonomi och A-kassan.',
  bullets: [
    'Cirka 70 procent arbetar i privat sektor och 30 procent i offentlig sektor.',
    'Fack och arbetsgivarorganisationer förhandlar om villkor.',
    'Arbetslöshetsförsäkringen administreras via A-kassor.',
  ],
  questions: [
    {
      id: 'k8-q1',
      prompt: 'Ungefär hur stor andel av de sysselsatta arbetar i privat sektor?',
      options: [
        { id: 'A', text: '30 procent' },
        { id: 'B', text: '50 procent' },
        { id: 'C', text: '70 procent' },
        { id: 'D', text: '90 procent' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Privat sektor omfattar privata företag och står för omkring 70 procent av arbetstillfällena. Resten är offentlig sektor.',
      explanationEn: 'About 70 percent of workers are employed in the private sector.',
      source: { chapter: 8, page: 27 },
    },
    {
      id: 'k8-q2',
      prompt: 'Vilken organisation representerar främst arbetstagare i LO-förbund?',
      options: [
        { id: 'A', text: 'Svenskt näringsliv' },
        { id: 'B', text: 'Landsorganisationen i Sverige (LO)' },
        { id: 'C', text: 'Arbetsgivarverket' },
        { id: 'D', text: 'Skatteverket' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'LO, TCO och SACO är de stora fackliga centralorganisationerna. LO samlar många arbetarförbund.',
      explanationEn: 'LO is a major trade union confederation for employees.',
      source: { chapter: 8, page: 28 },
    },
    {
      id: 'k8-q3',
      prompt: 'Vad gör A-kassan?',
      options: [
        { id: 'A', text: 'Betalar ut pension till alla över 65 år' },
        { id: 'B', text: 'Ger ersättning till arbetslösa medlemmar som uppfyller villkoren' },
        { id: 'C', text: 'Utser statsminister' },
        { id: 'D', text: 'Driver grundskolor' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Arbetslöshetskassor betalar arbetslöshetsersättning till medlemmar som arbetssöker aktivt och uppfyller kraven.',
      explanationEn: 'Unemployment insurance funds pay benefits to eligible job-seeking members.',
      source: { chapter: 8, page: 29 },
    },
    {
      id: 'k8-q4',
      prompt: 'Vad är olagligt enligt materialet om arbete och skatt?',
      options: [
        { id: 'A', text: 'Att betala skatt på lön' },
        { id: 'B', text: 'Att arbeta svart utan att betala skatt' },
        { id: 'C', text: 'Att vara medlem i facket' },
        { id: 'D', text: 'Att ta semester' },
      ],
      correctOptionId: 'B',
      explanationSv: 'Alla som arbetar ska betala skatt på inkomsten. Svartarbete bryter mot det.',
      explanationEn: 'Working without paying tax is illegal.',
      source: { chapter: 8, page: 29 },
    },
    {
      id: 'k8-q5',
      prompt: 'Vilken sektor finansieras främst med skatter och driver till exempel skola och polis?',
      options: [
        { id: 'A', text: 'Privat sektor' },
        { id: 'B', text: 'Offentlig sektor' },
        { id: 'C', text: 'Informell sektor' },
        { id: 'D', text: 'EU-kommissionen' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Offentlig sektor omfattar stat, regioner och kommuner och finansieras med skatter.',
      explanationEn: 'The public sector is tax-funded and includes schools and police.',
      source: { chapter: 8, page: 27 },
    },
    {
      id: 'k8-q6',
      prompt: 'Vad förhandlar fackförbund ofta om med arbetsgivaren?',
      options: [
        { id: 'A', text: 'Vem som blir kung' },
        { id: 'B', text: 'Löner och andra anställningsvillkor' },
        { id: 'C', text: 'EU-medlemskap' },
        { id: 'D', text: 'Skattesatser i riksdagen' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Facken förhandlar kollektivavtal om löner, arbetstid och andra villkor för medlemmarna.',
      explanationEn: 'Unions negotiate wages and employment terms with employers.',
      source: { chapter: 8, page: 28 },
    },
  ],
}
