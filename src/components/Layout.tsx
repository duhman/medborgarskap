import { Link, Outlet } from 'react-router-dom'
import { Disclaimer } from './Disclaimer'
import { Nav } from './Nav'
import { StatusStrip } from './StatusStrip'

const siblingSites = [
  { label: 'Maktkartan', href: 'https://maktkartan.se' },
  { label: 'Beredskapguide', href: 'https://www.beredskapguide.se' },
  { label: 'SprintSix', href: 'https://sprint6.app' },
  { label: 'BRF-Rapporten', href: 'https://brfrapporten.se' },
  { label: 'StockholmPuls', href: 'https://stockholm.adrianmarten.net' },
] as const

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <StatusStrip />
      <Nav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-line-strong bg-paper px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Disclaimer compact />
          <p className="text-xs leading-relaxed text-ink/60">
            Fristående övning till medborgarskapsprovet, baserad på UHR:s Sverige i fokus.
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:gap-8">
            <div className="space-y-2">
              <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink/60">
                Medborgarskap
              </p>
              <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <Link to="/integritet" className="text-accent hover:underline">
                  Integritet
                </Link>
                <Link to="/villkor" className="text-accent hover:underline">
                  Villkor
                </Link>
                <Link to="/om" className="text-accent hover:underline">
                  Om
                </Link>
              </nav>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink/60">
                Fler projekt
              </p>
              <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {siblingSites.map((site) => (
                  <a
                    key={site.href}
                    href={site.href}
                    className="text-ink/75 hover:text-accent hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {site.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
          <p className="text-xs text-ink/50">
            <a
              href="https://adrianmarten.net"
              className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
              target="_blank"
              rel="noreferrer"
            >
              Made by Adrian Martén
            </a>{' '}
            · © 2026 Medborgarskap
          </p>
        </div>
      </footer>
    </div>
  )
}
