import type { OfficialSource } from '../config/pathwaySources'
import { pdfPageUrl } from '../content/chapters/meta'
import type { QuestionSource } from '../content/types'
import { GfNum } from './GfNum'

type Props = {
  source: QuestionSource
  className?: string
  /** og:video beat B: label only, no blockquote (avoids overlap in narrow capture). */
  compact?: boolean
}

export function SourceCitation({ source, className = 'text-ink-3', compact = false }: Props) {
  const label =
    source.page != null ? (
      <>
        Kapitel <GfNum value={source.chapter} />, sida <GfNum value={source.page} /> (Sverige i fokus)
      </>
    ) : (
      <>
        Kapitel <GfNum value={source.chapter} /> (Sverige i fokus)
      </>
    )

  if (compact || !source.quote) {
    return (
      <p className={className} data-og-citation={compact ? 'true' : undefined}>
        {label}
      </p>
    )
  }

  return (
    <figure className={className}>
      <blockquote className="border-l-2 border-line-strong pl-3 italic">
        <p>”{source.quote}”</p>
      </blockquote>
      <figcaption className="mt-1">
        Så står det i{' '}
        <a
          href={pdfPageUrl(source.page)}
          className="mb-link-quiet"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sverige i fokus, kapitel <GfNum value={source.chapter} />
          {source.page != null && (
            <>
              , sida <GfNum value={source.page} />
            </>
          )}
          <span className="sr-only">, öppnas i ny flik</span>
        </a>
      </figcaption>
    </figure>
  )
}

type OfficialProps = {
  sources: Array<Omit<OfficialSource, 'publisher'> & { publisher: string }>
  className?: string
}

export function OfficialSourceCitation({ sources, className = 'text-xs text-ink-3' }: OfficialProps) {
  return (
    <ul className={className}>
      {sources.map((s) => (
        <li key={`${s.publisher}-${s.label}`}>
          Källa:{' '}
          <a
            href={s.url}
            className="mb-link-quiet"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.publisher}, ${s.label}, öppnas i ny flik`}
          >
            {s.publisher}, {s.label}
            <span aria-hidden="true"> ↗</span>
          </a>
          , kontrollerad <GfNum value={s.checkedAt} />
        </li>
      ))}
    </ul>
  )
}
