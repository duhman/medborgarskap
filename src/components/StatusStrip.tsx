import { Link } from 'react-router-dom'
import { officialLinks, uhrStatus } from '../config/status'

export function StatusStrip() {
  return (
    <aside
      className="border-b border-paper-muted bg-paper-muted/60 px-4 py-3 text-sm"
      aria-label="UHR status"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-medium text-ink">Nästa provtillfälle:</span>{' '}
          {uhrStatus.nextSitting}
        </p>
        <p className="text-ink/80">
          Anmälan: {uhrStatus.registrationOpen ? 'öppen' : 'stängd enligt uhr.se'}
        </p>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-ink/75">{uhrStatus.notes}</p>
      <p className="mx-auto mt-1 max-w-3xl text-xs text-ink/60">
        Bekräfta alltid datum och anmälan på{' '}
        <a
          href={officialLinks.medborgarskapsprov}
          className="text-accent underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          uhr.se
        </a>
        . Läs mer om statusremsan på{' '}
        <Link to="/om" className="text-accent underline-offset-2 hover:underline">
          Om sidan
        </Link>
        .
      </p>
    </aside>
  )
}
