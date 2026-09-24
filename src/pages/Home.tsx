import { Link } from 'react-router-dom'
import { Disclaimer } from '../components/Disclaimer'
import { officialLinks } from '../config/status'

export function Home() {
  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink/60">
          Fristående övning
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Lär dig Sverige i fokus i din egen takt
        </h1>
        <p className="max-w-2xl text-lg text-ink/85">
          Lyssna på UHR:s ljudfiler, läs kapitlen i den officiella PDF:en och öva med egna
          flervalsfrågor som anger källhänvisning. Gratis att använda, med UHR:s material i fokus
          - en lugn studiekompanjon, inte en provsimulering.
        </p>
      </header>

      <Disclaimer />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/behover-jag"
          className="inline-flex min-h-12 items-center justify-center rounded border border-accent bg-accent px-6 py-3 text-center font-medium text-white"
        >
          Behöver jag provet?
        </Link>
        <Link
          to="/kapitel"
          className="inline-flex min-h-12 items-center justify-center rounded border border-line-strong bg-raised px-6 py-3 text-center font-medium text-ink"
        >
          Börja studera
        </Link>
      </div>

      <section className="surface-raised space-y-3 p-6">
        <h2 className="text-xl font-semibold">Så fungerar det</h2>
        <ol className="list-decimal space-y-2 pl-5 text-ink/85">
          <li>Gå igenom checklistan om du osäker på om UHR:s prov gäller för dig.</li>
          <li>Välj kapitel, lyssna på MP3 och läs i PDF från UHR.</li>
          <li>Öva kapitlet med flervalsfrågor och läs förklaringar med källhänvisning.</li>
        </ol>
        <p className="text-sm text-ink/70">
          Officiellt material:{' '}
          <a href={officialLinks.utbildningsmaterial} className="text-accent hover:underline" target="_blank" rel="noreferrer">
            uhr.se/medborgarskapsprovet/utbildningsmaterial
          </a>
        </p>
      </section>
    </article>
  )
}
