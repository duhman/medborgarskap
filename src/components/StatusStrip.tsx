import { Link } from 'react-router-dom'
import { officialLinks, uhrStatus } from '../config/status'
import { ExternalLink } from './ExternalLink'

export function StatusStrip() {
  return (
    <aside className="border-b border-line-strong bg-paper-muted text-sm" aria-label="Provstatus">
      <details className="group mx-auto max-w-3xl px-4">
        <summary className="flex min-h-11 list-none items-center justify-between gap-3 py-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-ring)]">
          <span>
            <span className="font-medium text-ink">Nästa prov:</span>{' '}
            <span className="text-ink-2">{uhrStatus.nextSitting}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-ink-2 group-hover:text-ink">
            <span className="group-open:hidden">Mer</span>
            <span className="hidden group-open:inline">Dölj</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 12 12"
              className="size-3 transition-transform duration-150 group-open:rotate-180"
            >
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
        </summary>
        <div className="space-y-2 pb-3 text-ink-2">
          <p>
            <span className="font-medium text-ink">Anmälan:</span>{' '}
            {uhrStatus.registrationOpen ? 'öppen' : 'stängd enligt uhr.se'}
          </p>
          <p>{uhrStatus.notes}</p>
          <p>
            Senast kontrollerad mot uhr.se: <span className="gf-num">{uhrStatus.checkedAt}</span>.
            Kontrollera alltid datum och anmälan på{' '}
            <ExternalLink href={officialLinks.medborgarskapsprov}>uhr.se</ExternalLink>.{' '}
            <Link to="/om" className="mb-link-quiet">
              Om statusen
            </Link>
          </p>
        </div>
      </details>
    </aside>
  )
}
