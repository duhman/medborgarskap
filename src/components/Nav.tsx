import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded px-2 py-1.5 text-sm transition-colors',
    isActive
      ? 'font-semibold text-ink underline decoration-ink underline-offset-4'
      : 'font-medium text-ink/70 hover:text-ink',
  ].join(' ')

export function Nav() {
  return (
    <header className="border-b border-line-strong bg-paper">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <NavLink to="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
          Medborgarskap
        </NavLink>
        <nav className="flex flex-wrap gap-x-0.5 gap-y-0.5 sm:gap-1" aria-label="Huvudmeny">
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
