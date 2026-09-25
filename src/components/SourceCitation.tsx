import type { QuestionSource } from '../content/types'
import { GfNum } from './GfNum'

type Props = {
  source: QuestionSource
  className?: string
}

export function SourceCitation({ source, className = 'text-ink/60' }: Props) {
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
