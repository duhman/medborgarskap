import { NavLink } from 'react-router-dom'

const links = [
  { to: '/behover-jag', label: 'Behöver jag provet?' },
  { to: '/kapitel', label: 'Kapitel' },
  { to: '/provfragor', label: 'Provfrågor' },
  { to: '/om', label: 'Om' },
] as const

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    // The ring is drawn inside the link so the header never clips it.
    'inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-2.5 text-[0.9375rem] underline-offset-[6px] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-ring)] sm:px-3',
    isActive
      ? 'font-semibold text-ink underline decoration-ink decoration-2'
      : 'font-medium text-ink-2 hover:text-ink hover:underline hover:decoration-line-strong',
  ].join(' ')

export function Nav() {
  return (
    <header className="border-b border-line-strong bg-paper">
      <div className="mx-auto flex max-w-3xl flex-col px-4 sm:flex-row sm:items-center sm:justify-between">
        <NavLink
          to="/"
          className="flex min-h-12 items-center gap-2.5 self-start font-serif text-xl font-semibold tracking-tight text-ink no-underline hover:text-ink"
        >
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-[2px] bg-accent font-sans text-[13px] font-semibold text-accent-on"
          >
            M
          </span>
          Medborgarskap
        </NavLink>
        <nav aria-label="Huvudmeny" className="-mx-2.5 sm:mx-0 sm:-mr-3">
          {/* Wraps instead of scrolling sideways, so no link hides past the edge on a narrow screen. */}
          <ul className="flex flex-wrap">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
