import type { OfficialSource } from '../config/pathwaySources'
import type { QuestionSource } from '../content/types'
import { GfNum } from './GfNum'

type Props = {
  source: QuestionSource
  className?: string
}

export function SourceCitation({ source, className = 'text-ink-3' }: Props) {
  if (source.page != null) {
    return (
      <p className={className}>
        Kapitel <GfNum value={source.chapter} />, sida <GfNum value={source.page} /> (Sverige i fokus)
      </p>
    )
  }
  return (
    <p className={className}>
      Kapitel <GfNum value={source.chapter} /> (Sverige i fokus)
    </p>
  )
}

type OfficialProps = {
  sources: OfficialSource[]
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
