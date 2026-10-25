import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { pathwaySources } from '../config/pathwaySources'
import { officialLinks } from '../config/status'
import { GfNum } from '../components/GfNum'
import { OfficialSourceCitation } from '../components/SourceCitation'
import {
  derivePathwayOutcome,
  savePathwayAnswers,
  useProgressState,
} from '../lib/progress'

const citationClass = 'space-y-1 pt-2 text-sm text-ink-3'

export function BehoverJag() {
  // Saved in this browser only. The prerendered page starts empty and fills in after hydration.
  const answers = useProgressState().pathway
  const outcome = useMemo(() => derivePathwayOutcome(answers), [answers])

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">Behöver jag provet?</h1>
        <p className="text-lg leading-relaxed text-ink-2">
          Den här checklistan följer Migrationsverkets publicerade vägar för att visa
          samhällskunskap. Den ger inte ett juridiskt besked. Migrationsverket bedömer ditt ärende.
        </p>
      </header>

      <div className="space-y-6">
        <fieldset className="surface-raised space-y-2 p-4 sm:p-5">
          <legend className="text-[17px] font-semibold leading-snug">Hur gammal är du?</legend>
          <label className="mb-choice">
            <input
              type="radio"
              name="age"
              checked={answers.ageBracket === '16-66'}
              onChange={() => savePathwayAnswers({ ageBracket: '16-66' })}
            />
            <span>
              <GfNum value={16} />-<GfNum value={66} /> år{' '}
              <span className="text-ink-2">(prov kan krävas enligt nya regler)</span>
            </span>
          </label>
          <label className="mb-choice">
            <input
              type="radio"
              name="age"
              checked={answers.ageBracket === '67plus'}
              onChange={() => savePathwayAnswers({ ageBracket: '67plus' })}
            />
            <span>
              <GfNum value={67} /> år eller äldre{' '}
              <span className="text-ink-2">(åldersundantag kan gälla)</span>
            </span>
          </label>
          <OfficialSourceCitation sources={pathwaySources.age} className={citationClass} />
        </fieldset>

        <fieldset className="surface-raised space-y-2 p-4 sm:p-5">
          <legend className="text-[17px] font-semibold leading-snug">
            Har du godkänt betyg i samhällskunskap från årskurs 9 eller gymnasiet i Sverige?
          </legend>
          {(['yes', 'no', 'unsure'] as const).map((v) => (
            <label key={v} className="mb-choice">
              <input
                type="radio"
                name="school"
                checked={answers.schoolSamhall === v}
                onChange={() => savePathwayAnswers({ schoolSamhall: v })}
              />
              <span>{v === 'yes' ? 'Ja' : v === 'no' ? 'Nej' : 'Osäker'}</span>
            </label>
          ))}
          <OfficialSourceCitation sources={pathwaySources.school} className={citationClass} />
        </fieldset>

        <fieldset className="surface-raised space-y-2 p-4 sm:p-5">
          <legend className="text-[17px] font-semibold leading-snug">
            Har du godkänt betyg i samhällskunskap från komvux eller folkhögskola på gymnasial nivå?
          </legend>
          {(['yes', 'no', 'unsure'] as const).map((v) => (
            <label key={v} className="mb-choice">
              <input
                type="radio"
                name="komvux"
                checked={answers.komvuxFolk === v}
                onChange={() => savePathwayAnswers({ komvuxFolk: v })}
              />
              <span>{v === 'yes' ? 'Ja' : v === 'no' ? 'Nej' : 'Osäker'}</span>
            </label>
          ))}
          <OfficialSourceCitation sources={pathwaySources.komvux} className={citationClass} />
        </fieldset>

        <fieldset className="surface-raised space-y-2 p-4 sm:p-5">
          <legend className="text-[17px] font-semibold leading-snug">Läser du eller har du läst SFI?</legend>
          <p className="pb-1 text-[15px] text-ink-2">
            SFI gäller språkkravet, inte samhällskunskap. Godkänt betyg i den högsta kursen i SFI
            kan visa dina kunskaper i svenska, men ger inte undantag från provet i samhällskunskap.
            Provet i svenska kan införas senare än planerat. Tills vidare visar du språket med till
            exempel betyg från komvux, högsta SFI-kursen eller Tisus.
          </p>
          <label className="mb-choice">
            <input
              type="radio"
              name="sfi"
              checked={answers.sfiPath === 'yes'}
              onChange={() => savePathwayAnswers({ sfiPath: 'yes' })}
            />
            <span>Ja</span>
          </label>
          <label className="mb-choice">
            <input
              type="radio"
              name="sfi"
              checked={answers.sfiPath === 'no'}
              onChange={() => savePathwayAnswers({ sfiPath: 'no' })}
            />
            <span>Nej</span>
          </label>
          <OfficialSourceCitation sources={pathwaySources.sfi} className={citationClass} />
        </fieldset>
      </div>

      <section
        className="space-y-1 border border-ink bg-raised p-5 sm:p-6"
        aria-labelledby="outcome-heading"
      >
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">
          Indikation, inte beslut
        </p>
        <div aria-live="polite">
        <h2 id="outcome-heading" className="text-xl font-semibold">
          {outcome === 'likely-needed'
            ? 'Du kan behöva provet'
            : outcome === 'maybe-exempt'
              ? 'Du kanske inte behöver provet'
              : 'Svaret är inte klart än'}
        </h2>
        {outcome === 'likely-needed' && (
          <p className="mt-2">
            Du kan behöva UHR:s medborgarskapsprov om du inte kan visa samhällskunskap på annat
            sätt. Börja gärna med kapitel <GfNum value={1} />-<GfNum value={3} /> medan du planerar
            din ansökan.
          </p>
        )}
        {outcome === 'maybe-exempt' && (
          <p className="mt-2">
            Du kan kanske visa kunskap om samhället på annat sätt (betyg i samhällskunskap från
            grundskola, gymnasium, folkhögskola eller komvux, eller ålder). Kontrollera alltid mot
            Migrationsverkets aktuella regler.
          </p>
        )}
        {outcome === 'unclear' && (
          <p className="mt-2">
            Svara på frågorna ovan för en tydligare indikation. Vid tvivel: läs på Migrationsverket
            innan du anmäler dig till provet.
          </p>
        )}
        </div>
        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <a
            href={officialLinks.migrationsverket}
            className="mb-btn mb-btn--primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Läs på Migrationsverket
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (öppnas i ny flik)</span>
          </a>
          <Link to="/kapitel" className="mb-btn mb-btn--secondary">
            Börja studera
          </Link>
        </div>
        <p className="pt-3 text-sm text-ink-3">
          Nya regler från <GfNum value={6} /> juni <GfNum value={2026} />:{' '}
          <a
            href={officialLinks.reformNotice}
            className="mb-link-quiet"
            target="_blank"
            rel="noopener noreferrer"
          >
            Migrationsverkets nyhet<span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (öppnas i ny flik)</span>
          </a>
        </p>
      </section>
    </article>
  )
}
