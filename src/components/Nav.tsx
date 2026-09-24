import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-accent-soft text-accent' : 'text-ink/80 hover:bg-paper-muted hover:text-ink',
  ].join(' ')

export function Nav() {
  return (
    <header className="border-b border-paper-muted bg-paper">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <NavLink to="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
          Medborgarskap
        </NavLink>
        <nav className="flex flex-wrap gap-1" aria-label="Huvudmeny">
          <NavLink to="/behover-jag" className={linkClass}>
            Behöver jag provet?
          </NavLink>
          <NavLink to="/kapitel" className={linkClass}>
            Kapitel
          </NavLink>
          <NavLink to="/provfragor" className={linkClass}>
            Provfrågor
          </NavLink>
          <NavLink to="/om" className={linkClass}>
            Om
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
