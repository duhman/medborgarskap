import { practiceDisclaimer } from '../config/appFacts'

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <p
      className={
        compact
          ? 'text-sm leading-relaxed text-ink-2'
          : 'surface-raised px-4 py-3 text-sm leading-relaxed text-ink/80'
      }
    >
      {practiceDisclaimer}
    </p>
  )
}
