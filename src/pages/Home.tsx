import { Link } from 'react-router-dom'
import { ExternalLink } from '../components/ExternalLink'
import { GfNum } from '../components/GfNum'
import { ProgressMeter } from '../components/ProgressMeter'
import { officialLinks } from '../config/status'
import { getAllChapters } from '../content/chapters/meta'
import { getProgressState } from '../lib/progress'

type StudyProgress = {
  practised: number
  total: number
  next?: { slug: string; number: number; title: string }
}

/** Progress lives in localStorage; during prerender readState() falls back to empty and this returns null. */
function getStudyProgress(): StudyProgress | null {
  const chapters = getAllChapters()
  const { visitedChapters, quizResults } = getProgressState()
  if (visitedChapters.length === 0 && quizResults.length === 0) return null
  const done = new Set(quizResults.map((r) => r.slug))
  const practised = chapters.filter((c) => done.has(c.slug)).length
  const next = chapters.find((c) => !done.has(c.slug))
  return {
    practised,
    total: chapters.length,
    next: next && { slug: next.slug, number: next.number, title: next.title },
  }
}

const steps = [
  {
    to: '/behover-jag',
    title: 'Ta reda på om du behöver provet',
    text: 'Svara på fyra frågor. Du kanske kan visa dina kunskaper på ett annat sätt.',
  },
  {
    to: '/kapitel',
    title: 'Läs och lyssna',
    text: 'Välj ett kapitel. Lyssna på UHR:s ljudfil och läs i Sverige i fokus.',
  },
  {
    to: '/kapitel',
    title: 'Öva med frågor',
    text: 'Svara på frågor om kapitlet. Varje svar visar var i boken du kan läsa mer.',
  },
] as const

const practice = [
  {
    to: '/ovning/blandat',
    title: 'Blandade frågor',
    text: 'Frågor från alla kapitel i slumpad ordning.',
  },
  {
    to: '/ovning/mina-fel',
    title: 'Öva dina fel',
    text: 'Frågor som du har svarat fel på. De sparas bara i din webbläsare.',
  },
] as const

export function Home() {
  const progress = getStudyProgress()

  return (
    <article className="space-y-12">
      <header className="space-y-5">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">
          Gratis och fristående
        </p>
        <h1 className="text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
          Lär dig Sverige i fokus i din egen takt
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-2 sm:text-xl">
          Förbered dig för medborgarskapsprovet. Läs och lyssna på UHR:s material och öva sedan med
          frågor. Varje svar visar var i boken du hittar det.
        </p>
        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Link to="/kapitel" className="mb-btn mb-btn--primary sm:px-8">
            Börja studera
          </Link>
          <Link to="/behover-jag" className="mb-btn mb-btn--secondary">
            Behöver jag provet?
          </Link>
        </div>
        <p className="text-sm text-ink-3">
          Inte en officiell tjänst. Vi är inte knutna till UHR eller Migrationsverket.
        </p>
      </header>

      {progress && (
        <section aria-labelledby="progress-heading" className="surface-raised space-y-4 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="progress-heading" className="text-lg font-semibold">
              Dina framsteg
            </h2>
            <p className="text-sm text-ink-2">
              <GfNum value={progress.practised} /> av <GfNum value={progress.total} /> kapitel övade
            </p>
          </div>
          <ProgressMeter value={progress.practised} max={progress.total} />
          {progress.next ? (
            <Link
              to={`/kapitel/${progress.next.slug}`}
              className="group flex min-h-12 items-center justify-between gap-3 border-t border-line-strong pt-4 text-ink no-underline hover:text-ink"
            >
              <span>
                <span className="block text-sm text-ink-3">
                  Fortsätt med kapitel <GfNum value={progress.next.number} />
                </span>
                <span className="font-medium">{progress.next.title}</span>
              </span>
              <span
                aria-hidden="true"
                className="text-xl transition-transform duration-150 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          ) : (
            <p className="border-t border-line-strong pt-4 text-ink-2">
              Du har övat alla kapitel. Öva igen på de kapitel där du hade flest fel.
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="how-heading" className="space-y-4">
        <h2 id="how-heading" className="mb-section-head">
          Så fungerar det
        </h2>
        <ol className="divide-y divide-line-strong">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Link
                to={step.to}
                className="group flex items-start gap-4 py-4 text-ink no-underline hover:text-ink"
              >
                <GfNum value={i + 1} className="w-6 shrink-0 pt-0.5 text-2xl leading-none text-ink-3" />
                <span className="flex-1">
                  <span className="block font-semibold">{step.title}</span>
                  <span className="mt-1 block text-ink-2">{step.text}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="pt-0.5 text-xl transition-transform duration-150 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="practice-heading" className="space-y-4">
        <h2 id="practice-heading" className="mb-section-head">
          Öva mer
        </h2>
        <ul className="divide-y divide-line-strong">
          {practice.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="group flex items-start gap-4 py-4 text-ink no-underline hover:text-ink"
              >
                <span className="flex-1">
                  <span className="block font-semibold">{item.title}</span>
                  <span className="mt-1 block text-ink-2">{item.text}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="pt-0.5 text-xl transition-transform duration-150 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="official-heading" className="space-y-3">
        <h2 id="official-heading" className="mb-section-head">
          Officiellt material
        </h2>
        <p className="text-ink-2">
          Provet bygger på UHR:s bok Sverige i fokus. Boken och ljudfilerna är gratis hos UHR.
        </p>
        <ul className="space-y-1">
          <li>
            <ExternalLink href={officialLinks.utbildningsmaterial} className="mb-link-quiet inline-flex min-h-11 items-center">
              Sverige i fokus och ljudfiler (UHR)
            </ExternalLink>
          </li>
          <li>
            <Link to="/provfragor" className="mb-link-quiet inline-flex min-h-11 items-center">
              UHR:s exempel på provfrågor
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
