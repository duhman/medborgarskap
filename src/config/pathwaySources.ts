export type OfficialSource = {
  publisher: 'Migrationsverket' | 'UHR'
  label: string
  url: string
  checkedAt: string
}

export type PathwayQuestionKey = 'age' | 'school' | 'komvux' | 'sfi'

const MV_VUXNA =
  'https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html'
const MV_SVENSKA_NYHET =
  'https://www.migrationsverket.se/nyhetsarkiv/medborgarskapsprovetisvenskakanflyttasfram.5.15b2309e1a04e5ed2071cc5.html'
const UHR_FAQ = 'https://www.uhr.se/medborgarskapsprovet/fragor-och-svar/'

const CHECKED = '2026-10-24'

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
      checkedAt: CHECKED,
    },
  ],
  school: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna',
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
      label: 'Medborgarskap för vuxna',
      url: MV_VUXNA,
      checkedAt: CHECKED,
    },
  ],
  sfi: [
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskap för vuxna: kunskaper i svenska',
      url: MV_VUXNA,
      checkedAt: CHECKED,
    },
    {
      publisher: 'Migrationsverket',
      label: 'Medborgarskapsprovet i svenska kan flyttas fram (nyhet 2026-09-30)',
      url: MV_SVENSKA_NYHET,
      checkedAt: CHECKED,
    },
  ],
}
