import type { QuizOption } from './types'

export type OfficialSampleQuestion = {
  id: number
  prompt: string
  options: QuizOption[]
}

export const officialSampleQuestions: OfficialSampleQuestion[] = [
  {
    id: 1,
    prompt: 'Vad är den offentliga sektorns främsta uppgift?',
    options: [
      { id: 'A', text: 'Att driva företag med vinst' },
      { id: 'B', text: 'Att ordna välfärdstjänster som vård och utbildning' },
      { id: 'C', text: 'Att formulera och stifta nya lagar' },
      { id: 'D', text: 'Att representera Sverige internationellt' },
    ],
  },
  {
    id: 2,
    prompt: 'Vilken titel har Sveriges statschef?',
    options: [
      { id: 'A', text: 'Talman' },
      { id: 'B', text: 'Kung' },
      { id: 'C', text: 'Landshövding' },
      { id: 'D', text: 'Statsminister' },
    ],
  },
  {
    id: 3,
    prompt:
      'Vilken svensk naturresurs har under lång tid haft stor betydelse för Sveriges ekonomi?',
    options: [
      { id: 'A', text: 'Naturgas' },
      { id: 'B', text: 'Olja' },
      { id: 'C', text: 'Skog' },
      { id: 'D', text: 'Uran' },
    ],
  },
  {
    id: 4,
    prompt: 'Vilket land var under nästan 700 år, fram till år 1809, en del av Sverige?',
    options: [
      { id: 'A', text: 'Norge' },
      { id: 'B', text: 'Finland' },
      { id: 'C', text: 'Danmark' },
      { id: 'D', text: 'Estland' },
    ],
  },
  {
    id: 5,
    prompt:
      'En person skriver ett inlägg på sociala medier där hen kritiserar ett politiskt förslag. Vilket alternativ beskriver bäst hur yttrandefriheten fungerar?',
    options: [
      { id: 'A', text: 'Personen får bara uttrycka positiva åsikter om politiska förslag' },
      { id: 'B', text: 'Personen får uttrycka sin åsikt så länge det skrivna inte bryter mot lagen' },
      { id: 'C', text: 'Personen måste först be om tillstånd att skriva inlägget' },
      { id: 'D', text: 'Personen får inte namnge politikerna som lagt förslaget' },
    ],
  },
]
