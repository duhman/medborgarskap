import type { ChapterContent } from '../types'

export const lagOchRatt: ChapterContent = {
  slug: 'lag-och-ratt',
  number: 5,
  title: 'Lag och rätt',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/06_lag-och-ratt.mp3',
  intro:
    'Lagar skapar trygghet och ordning. Kapitlet beskriver grundlagarna, allemansrätten, polis och åklagare samt hur domstolar prövar brott och tvister.',
  bullets: [
    'Sverige har fyra grundlagar som är svårare att ändra än vanlig lag.',
    'Rättsväsendet utreder brott och domstolar dömer.',
    'Alla ska behandlas lika inför lagen.',
  ],
  questions: [
    {
      id: 'k5-q1',
      prompt: 'Hur många grundlagar har Sverige?',
      options: [
        { id: 'A', text: 'Två' },
        { id: 'B', text: 'Tre' },
        { id: 'C', text: 'Fyra' },
        { id: 'D', text: 'Fem' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Grundlagarna är regeringsformen, tryckfrihetsförordningen, yttrandefrihetsgrundlagen och successionsordningen.',
      explanationEn: 'Sweden has four fundamental laws.',
      source: { chapter: 5, page: 16 },
    },
    {
      id: 'k5-q2',
      prompt: 'Vilken grundlag reglerar vem som blir kung eller drottning efter den nuvarande?',
      options: [
        { id: 'A', text: 'Regeringsformen' },
        { id: 'B', text: 'Successionsordningen' },
        { id: 'C', text: 'Tryckfrihetsförordningen' },
        { id: 'D', text: 'Riksdagsordningen' },
      ],
      correctOptionId: 'B',
      explanationSv: 'Successionsordningen bestämmer tronföljden.',
      explanationEn: 'The order of succession is set out in the Act of Succession.',
      source: { chapter: 5, page: 16 },
    },
    {
      id: 'k5-q3',
      prompt: 'Vilken domstol är första instans i brottmål?',
      options: [
        { id: 'A', text: 'Hovrätten' },
        { id: 'B', text: 'Högsta domstolen' },
        { id: 'C', text: 'Tingsrätten' },
        { id: 'D', text: 'Förvaltningsrätten' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Tingsrätten är första instans. Hovrätten prövar överklagade mål och Högsta domstolen tar bara vissa viktiga fall.',
      explanationEn: 'District courts (tingsrätt) are the first instance in criminal cases.',
      source: { chapter: 5, page: 18 },
    },
    {
      id: 'k5-q4',
      prompt: 'Vad innebär presumtionen om oskuld i svensk rätt?',
      options: [
        { id: 'A', text: 'Den misstänkte är skyldig tills motsatsen bevisas' },
        { id: 'B', text: 'Den misstänkte betraktas som oskyldig tills dom faller' },
        { id: 'C', text: 'Endast åklagaren får vittna i rätten' },
        { id: 'D', text: 'Polisen dömer direkt vid gripande' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'En misstänkt ska betraktas som oskyldig tills domstolen dömt för brottet.',
      explanationEn: 'A suspect is presumed innocent until convicted.',
      source: { chapter: 5, page: 18 },
    },
    {
      id: 'k5-q5',
      prompt: 'Från vilken ålder är man straffmyndig i Sverige?',
      options: [
        { id: 'A', text: '13 år' },
        { id: 'B', text: '15 år' },
        { id: 'C', text: '18 år' },
        { id: 'D', text: '21 år' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Straffmyndighetsåldern är 15 år. Yngre barn som begår brott hanteras främst av socialtjänsten.',
      explanationEn: 'Criminal responsibility begins at age 15 in Sweden.',
      source: { chapter: 5, page: 19 },
    },
    {
      id: 'k5-q6',
      prompt: 'Vad skyddar allemansrätten enligt materialet?',
      options: [
        { id: 'A', text: 'Rätten att äga vilken mark som helst' },
        { id: 'B', text: 'Rätten att vistas i naturen på ett ansvarsfullt sätt' },
        { id: 'C', text: 'Rätten att jaga överallt utan tillstånd' },
        { id: 'D', text: 'Rätten att bygga på annans tomt' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Allemansrätten ger möjlighet att vara i naturen men kräver hänsyn till markägare och miljö. Den är skyddad i regeringsformen.',
      explanationEn: 'The right of public access allows responsible use of nature.',
      source: { chapter: 5, page: 17 },
    },
  ],
}
