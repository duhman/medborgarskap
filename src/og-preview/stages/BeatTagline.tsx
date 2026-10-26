import { OG_TAGLINE } from '../constants'

/** End card in the body region (band stays fixed). */
export function BeatTagline() {
  return (
    <div className="flex h-full flex-col justify-center pt-6">
      <p className="og-preview-tagline max-w-[1000px] text-ink">{OG_TAGLINE}</p>
    </div>
  )
}
