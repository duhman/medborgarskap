import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clearAllProgress } from '../lib/progress'

function ClearProgress() {
  const [cleared, setCleared] = useState(false)

  function clear() {
    if (!window.confirm('Vill du rensa allt som sidan har sparat i den här webbläsaren?')) return
    clearAllProgress()
    setCleared(true)
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={clear} className="mb-btn mb-btn--secondary">
        Rensa mina sparade uppgifter
      </button>
      <p role="status" className="text-ink-2">
        {cleared ? 'Klart. Dina framsteg, svar, repetitionshistorik och studieplan är borttagna från den här webbläsaren.' : ''}
      </p>
    </div>
  )
}

export function Integritet() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Integritetspolicy</h1>
        <p className="text-sm text-ink-2">Senast uppdaterad: 28 oktober 2026</p>
      </header>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Vem driver webbplatsen?</h2>
        <p>
          Medborgarskap är en fristående studiehjälp som drivs av Adrian Martén. Webbplatsen är
          inte knuten till UHR, Skolverket eller Migrationsverket. Frågor om integritet:{' '}
          <a href="mailto:adrian@adrianmarten.net" className="text-accent underline underline-offset-2">
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
        <h2 className="text-xl font-semibold text-ink">Det som sparas i din webbläsare</h2>
        <p>
          Din webbläsare sparar dina svar i vägledningen &quot;Behöver jag provet?&quot;, dina
          resultat i övningarna, frågor du har svarat fel på och var du är i en påbörjad övning.
          För Träna smart sparas också antal rätt och fel per fråga, följden av rätta svar och
          datum för senaste svaret. Din studieplans startdag och antal veckor sparas här också.
          Det sparas i webbläsarens lokala lagring (localStorage). Uppgifterna stannar på din enhet
          och skickas inte till oss. Du kan rensa dem här eller i webbläsarens inställningar.
        </p>
        <p>
          En omgång med ordkort finns bara medan du är kvar på sidan och sparas inte i
          localStorage. ChatGPT-integrationen kan inte läsa eller ändra din studieplan,
          repetitionshistorik eller andra lokalt sparade uppgifter.
        </p>
        <ClearProgress />
        <p>
          För att sidan ska fungera utan internet sparar webbläsaren också kopior av sidor och
          filer som du har öppnat här. Kopiorna innehåller inga
          uppgifter om dig och rensas på samma sätt.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Teknisk drift och loggar</h2>
        <p>
          Sidan ligger hos företaget Vercel. Leverantören kan logga teknisk information (till exempel IP,
          begärd sökväg och tidpunkt) för drift och säkerhet. Vi använder inte dessa loggar för
          marknadsföring.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">ChatGPT och andra AI-assistenter</h2>
        <p>
          Vår skrivskyddade integration söker och hämtar bara offentligt studiematerial och
          daterad provstatus. Den kan inte läsa dina övningssvar, framsteg eller lokalt sparade
          uppgifter. Skriv inte personnummer, privata ärenden eller andra känsliga uppgifter i en sökning.
        </p>
        <p>
          Assistentens leverantör skickar söktext eller dokument-id till vår tekniska tjänst hos Vercel.
          Vi sparar inte sökningar eller svar i någon applikationsdatabas och använder dem inte för
          analys eller marknadsföring. Teknisk information kan behandlas av Vercel för drift och
          säkerhet. Någon fast lagringstid för leverantörens driftloggar är inte verifierad.
        </p>
        <p>
          Samtalet hos ChatGPT eller en annan assistent hanteras enligt den leverantörens egna
          villkor, inställningar och integritetspolicy. Integrationen kan inte radera det samtalet.
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
          <a href="mailto:adrian@adrianmarten.net" className="text-accent underline underline-offset-2">
            adrian@adrianmarten.net
          </a>{' '}
          om du vill veta mer.
        </p>
        <p>
          Mer om webbplatsen finns på{' '}
          <Link to="/om" className="text-accent underline underline-offset-2">
            Om
          </Link>
          .
        </p>
      </section>
    </article>
  )
}
