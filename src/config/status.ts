export type UhrStatusConfig = {
  nextSitting: string
  registrationOpen: boolean
  notes: string
}

/** Uppdatera här när UHR publicerar ny information. Hitta aldrig på provdatum. */
export const uhrStatus: UhrStatusConfig = {
  nextSitting: 'Information kommer på uhr.se',
  registrationOpen: false,
  notes:
    'Första tillfället aug 2026 var utprövningsprov. Godkäntgräns sätts i efterhand.',
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
    'https://www.migrationsverket.se/nyheter/nyhetsarkiv/2026-05-06-nya-regler-for-svenskt-medborgarskap-fran-6-juni-2026.html',
} as const
