import { Disclaimer } from '../components/Disclaimer'
import { Link } from 'react-router-dom'

export function Villkor() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Användarvillkor</h1>
        <p className="text-sm text-ink/70">Senast uppdaterad: 24 september 2026</p>
      </header>

      <Disclaimer />

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Syfte</h2>
        <p>
          Medborgarskap är gratis studiehjälp för dig som förbereder dig inför
          medborgarskapsprovet. Innehållet är till för lärande och repetition, inte för
          myndighetsbeslut.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Ingen officiell koppling</h2>
        <p>
          Vi är inte knutna till UHR, Skolverket eller Migrationsverket. Datum, anmälan och
          regler för medborgarskap och prov kan ändras. Bekräfta alltid aktuell information på{' '}
          <a
            href="https://www.uhr.se"
            className="text-accent hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            uhr.se
          </a>{' '}
          och berörda myndigheter.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Innehåll och provfrågor</h2>
        <p>
          Kapitelintroduktioner och övningsfrågor är egna sammanfattningar och ersätter inte
          läsning av UHR:s material. De motsvarar inte det faktiska provet. Frågor som tydligt
          märkts som UHR-exempel är ordagrant från myndigheten.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Ingen garanti</h2>
        <p>
          Webbplatsen tillhandahålls i befintligt skick. Vi garanterar inte att all information
          är fullständig, felfri eller alltid uppdaterad. Använd den som komplement, inte som
          enda källa.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Tillåten användning</h2>
        <p>
          Du får läsa och öva för eget bruk. Automatiserad insamling som överbelastar sidan
          (till exempel aggressiv skrapning) är inte tillåten.
        </p>
      </section>

      <section className="space-y-2 text-sm text-ink/80">
        <h2 className="text-xl font-semibold text-ink">Kontakt</h2>
        <p>
          Frågor om villkoren:{' '}
          <a href="mailto:adrian@adrianmarten.net" className="text-accent hover:underline">
            adrian@adrianmarten.net
          </a>
          . Integritet:{' '}
          <Link to="/integritet" className="text-accent hover:underline">
            Integritetspolicy
          </Link>
          .
        </p>
      </section>
    </article>
  )
}
