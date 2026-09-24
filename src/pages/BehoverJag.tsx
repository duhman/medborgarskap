import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { officialLinks } from '../config/status'
import {
  derivePathwayOutcome,
  getPathwayAnswers,
  savePathwayAnswers,
  type PathwayAnswers,
} from '../lib/progress'

export function BehoverJag() {
  const [answers, setAnswers] = useState<PathwayAnswers>(() => getPathwayAnswers())

  useEffect(() => {
    savePathwayAnswers(answers)
  }, [answers])

  const outcome = useMemo(() => derivePathwayOutcome(answers), [answers])

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold">Behöver jag provet?</h1>
        <p className="text-ink/85">
          Den här checklistan följer Migrationsverkets publicerade vägar för att visa
          samhällskunskap. Den ger inte ett juridiskt besked. Migrationsverket bedömer ditt ärende.
        </p>
      </header>

      <div className="space-y-6">
        <fieldset className="space-y-3 rounded-xl border border-paper-muted bg-white/50 p-5">
          <legend className="px-1 font-medium">Hur gammal är du?</legend>
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="radio"
              name="age"
              checked={answers.ageBracket === '16-66'}
              onChange={() => setAnswers((a) => ({ ...a, ageBracket: '16-66' }))}
            />
            16-66 år (prov kan krävas enligt nya regler)
          </label>
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="radio"
              name="age"
              checked={answers.ageBracket === '67plus'}
              onChange={() => setAnswers((a) => ({ ...a, ageBracket: '67plus' }))}
            />
            67 år eller äldre (åldersundantag kan gälla)
          </label>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-paper-muted bg-white/50 p-5">
          <legend className="px-1 font-medium">
            Har du godkända betyg i samhällskunskap från svensk skola?
          </legend>
          {(['yes', 'no', 'unsure'] as const).map((v) => (
            <label key={v} className="flex min-h-11 items-center gap-3">
              <input
                type="radio"
                name="school"
                checked={answers.schoolSamhall === v}
                onChange={() => setAnswers((a) => ({ ...a, schoolSamhall: v }))}
              />
              {v === 'yes' ? 'Ja' : v === 'no' ? 'Nej' : 'Osäker'}
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-paper-muted bg-white/50 p-5">
          <legend className="px-1 font-medium">
            Har du motsvarande utbildning via komvux eller folkhögskola?
          </legend>
          {(['yes', 'no', 'unsure'] as const).map((v) => (
            <label key={v} className="flex min-h-11 items-center gap-3">
              <input
                type="radio"
                name="komvux"
                checked={answers.komvuxFolk === v}
                onChange={() => setAnswers((a) => ({ ...a, komvuxFolk: v }))}
              />
              {v === 'yes' ? 'Ja' : v === 'no' ? 'Nej' : 'Osäker'}
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-paper-muted bg-white/50 p-5">
          <legend className="px-1 font-medium">
            Kan du visa samhällskunskap via SFI kurs D, motsvarande, eller annat sätt som
            Migrationsverket dokumenterar?
          </legend>
          <p className="text-sm text-ink/70">
            Det här gäller kunskapskravet, inte språkkravet. Migrationsverket avgör om din
            dokumentation räcker.
          </p>
          {(['yes', 'no', 'unsure'] as const).map((v) => (
            <label key={v} className="flex min-h-11 items-center gap-3">
              <input
                type="radio"
                name="sfiKnowledge"
                checked={answers.sfiKnowledgeAlternate === v}
                onChange={() => setAnswers((a) => ({ ...a, sfiKnowledgeAlternate: v }))}
              />
              {v === 'yes' ? 'Ja' : v === 'no' ? 'Nej' : 'Osäker'}
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-paper-muted bg-white/50 p-5">
          <legend className="px-1 font-medium">Studerar du SFI just nu?</legend>
          <p className="text-sm text-ink/70">
            SFI handlar om svenska språket. Språkkrav och samhällskunskap är separata spår i
            medborgarskapsprocessen. Att studera SFI språk ger inte automatiskt undantag från
            medborgarskapsprovet.
          </p>
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="radio"
              name="sfi"
              checked={answers.sfiPath === 'yes'}
              onChange={() => setAnswers((a) => ({ ...a, sfiPath: 'yes' }))}
            />
            Ja
          </label>
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="radio"
              name="sfi"
              checked={answers.sfiPath === 'no'}
              onChange={() => setAnswers((a) => ({ ...a, sfiPath: 'no' }))}
            />
            Nej
          </label>
        </fieldset>
      </div>

      <section
        className="rounded-xl border-2 border-accent/30 bg-accent-soft/50 p-6"
        aria-live="polite"
      >
        <h2 className="font-serif text-xl font-semibold">Indikation (inte beslut)</h2>
        {outcome === 'likely-needed' && (
          <p className="mt-2">
            Du kan behöva UHR:s medborgarskapsprov om du inte kan visa samhällskunskap på annat
            sätt. Börja gärna med kapitel 1-3 medan du planerar din ansökan.
          </p>
        )}
        {outcome === 'maybe-exempt' && (
          <p className="mt-2">
            Du kan kanske visa kunskap på annat sätt (betyg, utbildning, SFI D eller motsvarande,
            eller ålder). Kontrollera alltid mot Migrationsverkets aktuella regler.
          </p>
        )}
        {outcome === 'unclear' && (
          <p className="mt-2">
            Svara på frågorna ovan för en tydligare indikation. Vid tvivel: läs på Migrationsverket
            innan du anmäler dig till provet.
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={officialLinks.migrationsverket}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white"
            target="_blank"
            rel="noreferrer"
          >
            Läs på Migrationsverket
          </a>
          <Link
            to="/kapitel"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink/20 bg-white px-5 py-2 text-sm font-medium"
          >
            Till kapitlen
          </Link>
        </div>
        <p className="mt-3 text-xs text-ink/60">
          Nya regler från 6 juni 2026:{' '}
          <a href={officialLinks.reformNotice} className="text-accent hover:underline" target="_blank" rel="noreferrer">
            Migrationsverkets nyhet
          </a>
        </p>
      </section>
    </article>
  )
}
