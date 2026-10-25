import { Link } from 'react-router-dom'
import { officialLinks, uhrStatus } from '../config/status'
import { SOURCE_PDF_VERSION, totalQuestionCount } from '../content/chapters/meta'
import { GfNum } from '../components/GfNum'
import { CONTACT_EMAIL, REPO_URL } from '../lib/report'

const sources = [
  { label: 'Sverige i fokus (PDF)', url: officialLinks.pdf },
  { label: 'Utbildningsmaterial (PDF + MP3)', url: officialLinks.utbildningsmaterial },
  { label: 'Medborgarskapsprov (UHR)', url: officialLinks.medborgarskapsprov },
  { label: 'Frågor och svar', url: officialLinks.faq },
  { label: 'Anmälan', url: officialLinks.registration },
  { label: 'Migrationsverket (medborgarskap vuxna)', url: officialLinks.migrationsverket },
  { label: 'Reform 6 juni 2026', url: officialLinks.reformNotice },
]

const questionCount = totalQuestionCount

export function Om() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Om Medborgarskap</h1>
        <p className="text-ink/85">
          Personlig, fristående studiehjälp av Adrian Martén. Gratis att använda. Sidan finns live
          på{' '}
          <a
            href="https://medborgarskap.adrianmarten.net"
            className="text-accent underline underline-offset-2"
          >
            medborgarskap.adrianmarten.net
          </a>
          .
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Källor</h2>
        <div className="surface-raised overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead className="bg-paper-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Resurs</th>
                <th className="px-4 py-2 font-medium">Länk</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.url} className="border-t border-line-strong">
                  <td className="px-4 py-2">{s.label}</td>
                  <td className="px-4 py-2">
                    <a
                      href={s.url}
                      className="mb-link-quiet"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sr-only">{s.label}, </span>
                      {new URL(s.url).hostname.replace(/^www\./, '')}
                      <span aria-hidden="true"> ↗</span>
                      <span className="sr-only"> (öppnas i ny flik)</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-raised space-y-2 p-5 text-sm">
        <h2 className="text-xl font-semibold">Statusremsa</h2>
        <p>
          Nästa tillfälle: <strong>{uhrStatus.nextSitting}</strong>. Anmälan:{' '}
          {uhrStatus.registrationOpen ? 'öppen' : 'stängd'}.
        </p>
        <p>{uhrStatus.notes}</p>
        <p>Senast kontrollerad mot uhr.se: {uhrStatus.checkedAt}.</p>
        <p className="text-ink-2">
          Status hålls uppdaterad av sidans ägare utifrån UHR:s publicerade information. Vi
          anger inte datum som UHR inte publicerat. Bekräfta alltid på{' '}
          <a
            href={officialLinks.medborgarskapsprov}
            className="text-accent underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            uhr.se
          </a>
          .
        </p>
      </section>

      <section className="space-y-3 text-sm text-ink/85" aria-labelledby="hur-vi-gor">
        <h2 id="hur-vi-gor" className="text-xl font-semibold text-ink">
          Hur vi gör frågorna
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>En källa.</strong> Alla <GfNum value={questionCount} /> övningsfrågor bygger
            bara på UHR:s Sverige i fokus, korrigerad version {SOURCE_PDF_VERSION}. Provet bygger på
            samma material.
          </li>
          <li>
            <strong>Citat och sida.</strong> Efter rättningen visar varje fråga meningen i
            materialet som svaret bygger på, med kapitel och sida. Ett automatiskt test kontrollerar
            att citaten finns i PDF:en.
          </li>
          <li>
            <strong>Granskning.</strong> Varje kapitel visar när frågorna senast granskades mot
            materialet. När UHR publicerar en ny version granskar vi om alla kapitel innan de
            visas som aktuella.
          </li>
          <li>
            <strong>Gällande lag.</strong> Där materialet är äldre än en lagändring, till exempel
            rösträtt i kommunval eller straffmyndighetsåldern, förklarar vi skillnaden i stället för
            att fråga om den.
          </li>
          <li>
            <strong>Egna frågor.</strong> Frågorna är skrivna för sidan. De är inte kopierade från
            UHR:s provfrågor eller från kommersiella tjänster. UHR:s fem exempel finns separat och
            märkta på{' '}
            <Link to="/provfragor" className="text-accent underline underline-offset-2">
              Provfrågor
            </Link>
            .
          </li>
          <li>
            <strong>Fel rättas snabbt.</strong> Varje fråga har en länk för att rapportera fel.
            Målet är att ett känt fel aldrig ska ligga kvar mer än en vecka. Du kan också mejla{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>{' '}
            eller skriva ett ärende på{' '}
            <a
              href={`${REPO_URL}/issues`}
              className="text-accent underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </li>
        </ul>
        <p>
          Svar om provdatum, format och krav finns samlade på{' '}
          <Link to="/vanliga-fragor" className="text-accent underline underline-offset-2">
            Vanliga frågor
          </Link>
          .
        </p>
        <p className="text-ink-2">
          Sidan är inte en del av UHR, Skolverket eller Migrationsverket, och UHR har inte granskat
          frågorna. Läs alltid materialet själv: övningsfrågorna är ett komplement.
        </p>
      </section>

      <section className="space-y-2 text-sm text-ink/80">
        <h2 className="text-xl font-semibold text-ink">Innehåll</h2>
        <p>
          Kapitelintroduktioner och övningsfrågor är egna sammanfattningar. De ersätter inte
          läsning av PDF. Fem exempel på provfrågor är ordagrant från UHR och märkta som sådana.
        </p>
        <p>
          Kontakt: via GitHub-projektet{' '}
          <a
            href="https://github.com/duhman/medborgarskap"
            className="text-accent underline underline-offset-2"
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
