import { OG_URL_LABEL } from '../constants'

/** End card in the body region (band stays fixed). */
export function BeatTagline() {
  return (
    <div className="flex h-full flex-col justify-center gap-6 pt-4 text-center">
      <p className="og-preview-tagline m-0 text-ink">
        Plugga till medborgarskapsprovet.
        <br />
        Med rätt källa.
      </p>
      <p className="og-preview-tagline-url m-0">{OG_URL_LABEL}</p>
    </div>
  )
}
