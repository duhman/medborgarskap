export type OfficialSource = {
  publisher: 'Migrationsverket' | 'UHR'
  label: string
  url: string
  checkedAt: string
}

export type PathwayQuestionKey = 'age' | 'school' | 'komvux' | 'sfiKnowledge' | 'sfi'

const MV_VUXNA =
  'https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html'
const MV_SVENSKA_NYHET =
  'https://www.migrationsverket.se/nyheter/nyhetsarkiv/2026-09-30-medborgarskapsprovet-i-svenska-kan-flyttas-fram.html'
const UHR_FAQ = 'https://www.uhr.se/medborgarskapsprovet/fragor-och-svar/'

const CHECKED = '2026-10-09'

/**
 * Officiella källor per fråga i "Behöver jag provet?".
 * Kontrollera länkarna och uppdatera checkedAt när sidorna ändras.
 */
export const pathwaySources: Record<PathwayQuestionKey, OfficialSource[]> = {
  age: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna: kunskaper i svenska och om det svenska samhället',
      url: MV_VUXNA,
      checkedAt: CHECKED,
    },
  ],
  school: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna: kunskaper om det svenska samhället, godkända meriter',
      url: MV_VUXNA,
      checkedAt: CHECKED,
    },
    {
      publisher: 'UHR',
      label: 'Frågor och svar om medborgarskapsprovet',
      url: UHR_FAQ,
      checkedAt: CHECKED,
    },
  ],
  komvux: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna: kunskaper om det svenska samhället, godkända meriter',
      url: MV_VUXNA,
      checkedAt: CHECKED,
    },
  ],
  sfiKnowledge: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna: godkända meriter för svenska och för samhällskunskap',
      url: MV_VUXNA,
      checkedAt: CHECKED,
    },
  ],
  sfi: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskapsprovet i svenska kan flyttas fram (nyhet 2026-09-30)',
      url: MV_SVENSKA_NYHET,
      checkedAt: CHECKED,
    },
  ],
}
