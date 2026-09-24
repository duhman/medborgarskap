import { officialLinks, uhrStatus } from '../config/status'
import { Disclaimer } from '../components/Disclaimer'

const sources = [
  { label: 'Sverige i fokus (PDF)', url: officialLinks.pdf },
  { label: 'Utbildningsmaterial (PDF + MP3)', url: officialLinks.utbildningsmaterial },
  { label: 'Medborgarskapsprov (UHR)', url: officialLinks.medborgarskapsprov },
  { label: 'Frågor och svar', url: officialLinks.faq },
  { label: 'Anmälan', url: officialLinks.registration },
  { label: 'Migrationsverket (medborgarskap vuxna)', url: officialLinks.migrationsverket },
  { label: 'Reform 6 juni 2026', url: officialLinks.reformNotice },
]

export function Om() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold">Om Medborgarskap</h1>
        <p className="text-ink/85">
          Personlig, fristående studiehjälp av Adrian Martén. Gratis att använda. Planerad adress:{' '}
          <span className="whitespace-nowrap">medborgarskap.adrianmarten.net</span>
        </p>
      </header>

      <Disclaimer />

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Källor</h2>
        <div className="overflow-x-auto rounded-xl border border-paper-muted">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead className="bg-paper-muted/50">
              <tr>
                <th className="px-4 py-2 font-medium">Resurs</th>
                <th className="px-4 py-2 font-medium">Länk</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.url} className="border-t border-paper-muted">
                  <td className="px-4 py-2">{s.label}</td>
                  <td className="px-4 py-2">
                    <a href={s.url} className="break-all text-accent hover:underline" target="_blank" rel="noreferrer">
                      {s.url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2 rounded-xl border border-paper-muted bg-white/40 p-5 text-sm">
        <h2 className="font-serif text-xl font-semibold">Statusremsa</h2>
        <p>
          Nästa tillfälle: <strong>{uhrStatus.nextSitting}</strong>. Anmälan:{' '}
          {uhrStatus.registrationOpen ? 'öppen' : 'stängd'}.
        </p>
        <p>{uhrStatus.notes}</p>
        <p className="text-ink/70">
          Redigera <code className="rounded bg-paper px-1">src/config/status.ts</code> när UHR
          uppdaterar information. Låt bli att gissa datum.
        </p>
      </section>

      <section className="space-y-2 text-sm text-ink/80">
        <h2 className="font-serif text-xl font-semibold text-ink">Innehåll</h2>
        <p>
          Kapitelintroduktioner och övningsfrågor är egna sammanfattningar. De ersätter inte
          läsning av PDF. Fem exempel på provfrågor är ordagrant från UHR och märkta som sådana.
        </p>
        <p>
          Kontakt: via GitHub-projektet{' '}
          <a
            href="https://github.com/duhman/medborgarskap"
            className="text-accent hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            duhman/medborgarskap
          </a>
          .
        </p>
      </section>
    </article>
  )
}
