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

const siteLinks = [
  { to: '/vanliga-fragor', label: 'Vanliga frågor' },
  { to: '/om', label: 'Om' },
  { to: '/integritet', label: 'Integritet' },
  { to: '/villkor', label: 'Villkor' },
] as const

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        Hoppa till innehåll
      </a>
      <StatusStrip />
      <Nav />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-16 outline-none sm:pt-12"
      >
        <Outlet />
      </main>
      <footer role="contentinfo" className="border-t border-line-strong bg-paper-muted">
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
          <Disclaimer compact />
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="mb-section-head">Medborgarskap</p>
              <nav aria-label="Medborgarskap">
                <ul className="flex flex-wrap gap-x-5 text-[15px]">
                  {siteLinks.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="mb-link-quiet inline-flex min-h-11 items-center">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="space-y-2">
              <p className="mb-section-head">Fler projekt</p>
              <nav aria-label="Fler projekt">
                <ul className="flex flex-wrap gap-x-5 text-[15px]">
                  {siblingSites.map((site) => (
                    <li key={site.href}>
                      <a
                        href={site.href}
                        className="mb-link-quiet inline-flex min-h-11 items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {site.label}
                        <span className="sr-only"> (öppnas i ny flik)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
          <p className="text-sm text-ink-3">
            <a
              href="https://adrianmarten.net"
              className="mb-link-quiet"
              target="_blank"
              rel="noopener noreferrer"
            >
              Made by Adrian Martén
              <span className="sr-only"> (öppnas i ny flik)</span>
            </a>{' '}
            · © <span className="gf-num">2026</span> Medborgarskap
          </p>
        </div>
      </footer>
    </div>
  )
}
