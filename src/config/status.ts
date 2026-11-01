export type UhrStatusConfig = {
  /** Datum (YYYY-MM-DD) då uppgifterna senast jämfördes med uhr.se. */
  checkedAt: string
  nextSitting: string
  registrationOpen: boolean
  notes: string
}

/**
 * Uppdatera här när UHR publicerar ny information. Hitta aldrig på provdatum.
 * Källor: UHR:s översikt (uppdaterad 2026-10-22) och resultatnyhet (2026-10-22), kontrollerade 2026-11-01.
 */
export const uhrStatus: UhrStatusConfig = {
  checkedAt: '2026-11-01',
  nextSitting: 'planeras april-maj 2027 enligt UHR, datum och plats kommer',
  registrationOpen: false,
  notes:
    'Provet den 15 augusti 2026 var ett utprövningsprov. UHR fastställde då godkäntgränsen till 28 av 40 poäng. UHR har inte publicerat provtid, antal frågor, avgift eller godkäntgräns för nästa tillfälle.',
}

export const officialLinks = {
  pdf: 'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/sverige-i-fokus_.pdf',
  utbildningsmaterial: 'https://www.uhr.se/medborgarskapsprovet/utbildningsmaterial/',
  medborgarskapsprov: 'https://www.uhr.se/medborgarskapsprovet/',
  trialResults:
    'https://www.uhr.se/om-uhr/nyheter/2026-nyheter/resultaten-fran-medborgarskapsprovet-i-samhallskunskap-klara/',
  faq: 'https://www.uhr.se/medborgarskapsprovet/fragor-och-svar/',
  registration: 'https://medborgarskapsprovet.uhr.se/',
  migrationsverket:
    'https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html',
  reformNotice:
    'https://www.migrationsverket.se/nyhetsarkiv/nyareglerforsvensktmedborgarskapfran6juni2026.5.4d7d222919d2a911cf7a35.html',
} as const
