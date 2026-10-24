export type UhrStatusConfig = {
  /** Datum (YYYY-MM-DD) då uppgifterna senast jämfördes med uhr.se. */
  checkedAt: string
  nextSitting: string
  registrationOpen: boolean
  notes: string
}

/**
 * Uppdatera här när UHR publicerar ny information. Hitta aldrig på provdatum.
 * Källa: uhr.se/medborgarskapsprovet/om-medborgarskapsprovet/ (uppdaterad 2026-10-22, kontrollerad 2026-10-24).
 */
export const uhrStatus: UhrStatusConfig = {
  checkedAt: '2026-10-24',
  nextSitting: 'planeras april-maj 2027 enligt UHR, datum och plats kommer',
  registrationOpen: false,
  notes:
    'Provet 15 augusti 2026 var ett utprövningsprov. UHR har ännu inte publicerat provtid, antal frågor eller avgift för nästa tillfälle.',
}

export const officialLinks = {
  pdf: 'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/sverige-i-fokus_.pdf',
  utbildningsmaterial: 'https://www.uhr.se/medborgarskapsprovet/utbildningsmaterial/',
  medborgarskapsprov: 'https://www.uhr.se/medborgarskapsprovet/',
  faq: 'https://www.uhr.se/medborgarskapsprovet/fragor-och-svar/',
  registration: 'https://medborgarskapsprovet.uhr.se/',
  migrationsverket:
    'https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html',
  reformNotice:
    'https://www.migrationsverket.se/nyhetsarkiv/nyareglerforsvensktmedborgarskapfran6juni2026.5.4d7d222919d2a911cf7a35.html',
} as const
