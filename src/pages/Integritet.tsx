import { Link } from 'react-router-dom'

export function Integritet() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Integritetspolicy</h1>
        <p className="text-sm text-ink/70">Senast uppdaterad: 24 september 2026</p>
      </header>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Vem driver webbplatsen?</h2>
        <p>
          Medborgarskap är en fristående studiehjälp som drivs av Adrian Martén. Webbplatsen är
          inte knuten till UHR, Skolverket eller Migrationsverket. Frågor om integritet:{' '}
          <a href="mailto:adrian@adrianmarten.net" className="text-accent hover:underline">
            adrian@adrianmarten.net
          </a>
          .
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Konton och betalning</h2>
        <p>
          Det finns inga användarkonton, ingen inloggning, ingen betalning och inga
          reklamcookies. Du behöver inte lämna namn eller e-post för att använda sidan.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">localStorage på din enhet</h2>
        <p>
          Webbläsaren kan spara dina svar i vägledningen &quot;Behöver jag ta provet?&quot; och
          dina quizresultat i localStorage. Uppgifterna stannar på din enhet och skickas inte
          till oss som applikationsdata. Du kan rensa dem när som helst via webbläsarens
          inställningar.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Teknisk drift och loggar</h2>
        <p>
          Sidan hostas hos Vercel. Leverantören kan logga teknisk information (till exempel IP,
          begärd sökväg och tidpunkt) för drift och säkerhet. Vi använder inte dessa loggar för
          marknadsföring.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Externa länkar</h2>
        <p>
          Länkar till UHR, Migrationsverket och andra myndigheter leder bort från den här
          webbplatsen. Deras egna integritetspolicyer gäller där.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Spårning och försäljning</h2>
        <p>
          Vi sätter inte in marknadsföringsspårare och säljer inte personuppgifter. Om detta
          ändras uppdateras den här sidan.
        </p>
      </section>

      <section className="space-y-2 text-sm text-ink/80">
        <h2 className="text-xl font-semibold text-ink">Dina rättigheter</h2>
        <p>
          Eftersom vi inte samlar in konton eller applikationsdata på servern handlar de flesta
          frågor om det som finns i din webbläsare (localStorage) eller hos hostingleverantören.
          Kontakta oss på{' '}
          <a href="mailto:adrian@adrianmarten.net" className="text-accent hover:underline">
            adrian@adrianmarten.net
          </a>{' '}
          om du vill veta mer.
        </p>
        <p>
          Mer om webbplatsen finns på{' '}
          <Link to="/om" className="text-accent hover:underline">
            Om
          </Link>
          .
        </p>
      </section>
    </article>
  )
}
