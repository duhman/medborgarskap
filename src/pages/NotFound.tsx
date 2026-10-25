import { Link } from 'react-router-dom'

const destinations = [
  { to: '/', title: 'Startsidan', text: 'Börja här om du är ny.' },
  { to: '/kapitel', title: 'Alla kapitel', text: 'Läs, lyssna och öva kapitel för kapitel.' },
  { to: '/ovning/smart', title: 'Träna smart', text: 'Dina fel och frågor att repetera först.' },
  { to: '/studieplan', title: 'Studieplan', text: 'En plan vecka för vecka fram till provet.' },
  { to: '/vanliga-fragor', title: 'Vanliga frågor', text: 'När är provet och vem måste skriva det?' },
] as const

export function NotFound() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">Fel 404</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Sidan hittades inte</h1>
        <p className="text-lg text-ink-2">
          Adressen finns inte, eller så har sidan flyttat. Dina svar och din studieplan finns kvar.
          Välj var du vill fortsätta.
        </p>
      </header>
      <ul className="divide-y divide-line-strong">
        {destinations.map((d) => (
          <li key={d.to}>
            <Link to={d.to} className="group flex items-start gap-4 py-4 text-ink no-underline hover:text-ink">
              <span className="flex-1">
                <span className="block font-semibold">{d.title}</span>
                <span className="mt-1 block text-ink-2">{d.text}</span>
              </span>
              <span aria-hidden="true" className="pt-0.5 text-xl transition-transform duration-150 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
