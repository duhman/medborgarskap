export type OfficialSource = {
  publisher: 'Migrationsverket' | 'UHR'
  label: string
  url: string
  checkedAt: string
}

export type PathwayQuestionKey = 'age' | 'school' | 'komvux' | 'sfi'

const MV_VUXNA =
  'https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html'
const UHR_FAQ = 'https://www.uhr.se/medborgarskapsprovet/fragor-och-svar/'

const MV_CHECKED = '2026-11-10'
const UHR_CHECKED = '2026-10-24'

/**
 * Officiella källor per fråga i "Behöver jag provet?".
 * Kontrollera länkarna och uppdatera checkedAt när sidorna ändras.
 */
export const pathwaySources: Record<PathwayQuestionKey, OfficialSource[]> = {
  age: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna',
      url: MV_VUXNA,
      checkedAt: MV_CHECKED,
    },
  ],
  school: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna',
      url: MV_VUXNA,
      checkedAt: MV_CHECKED,
    },
    {
      publisher: 'UHR',
      label: 'Frågor och svar om medborgarskapsprovet',
      url: UHR_FAQ,
      checkedAt: UHR_CHECKED,
    },
  ],
  komvux: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna',
      url: MV_VUXNA,
      checkedAt: MV_CHECKED,
    },
  ],
  sfi: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna: kunskaper i svenska',
      url: MV_VUXNA,
      checkedAt: MV_CHECKED,
    },
  ],
}
