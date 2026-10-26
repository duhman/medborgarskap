import { OG_URL_LABEL } from './constants'

export function OgPreviewBand() {
  return (
    <div className="og-preview-band" data-og-fixed-band="true">
      <div className="og-preview-wordmark flex items-center gap-3 font-serif font-semibold tracking-tight text-ink">
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-[2px] bg-accent font-sans text-[22px] font-semibold text-accent-on"
        >
          M
        </span>
        Medborgarskap
      </div>
      <p className="og-preview-url m-0 font-mono text-ink-2">{OG_URL_LABEL}</p>
    </div>
  )
}
