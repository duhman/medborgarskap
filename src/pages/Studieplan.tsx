import { useRef, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { GfNum } from '../components/GfNum'
import { uhrStatus } from '../config/status'
import { getAllChapters } from '../content/chapters/meta'
import { localDay, saveStudyPlan, useProgressState, type ProgressState } from '../lib/progress'
import {
  addDays,
  buildPlan,
  currentWeek,
  PLAN_WEEK_CHOICES,
  weeksUntil,
  type StudyPlanSettings,
} from '../lib/studyPlan'

/** UHR plans the next sitting for April-May 2027 (src/config/status.ts); no date is published. */
const PLANNED_SITTING_MONTH_START = '2027-04-01'

const noopSubscribe = () => () => {}

const formatDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', timeZone: 'UTC' })

export function Studieplan() {
  const progress = useProgressState()
  const headingRef = useRef<HTMLHeadingElement>(null)

  function choose(weeks: number) {
    saveStudyPlan({ start: localDay(), weeks })
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">Planera</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Studieplan</h1>
        <p className="text-ink-2">
          Få en plan vecka för vecka genom de 13 kapitlen i Sverige i fokus, med veckor för
          repetition på slutet. Planen bockar av kapitel när du har övat dem. Den sparas bara i din
          egen webbläsare.
        </p>
        <p className="text-sm text-ink-3">Nästa prov: {uhrStatus.nextSitting}.</p>
      </header>

      {progress.plan ? (
        <Plan plan={progress.plan} progress={progress} headingRef={headingRef} />
      ) : (
        <Picker onChoose={choose} />
      )}
    </article>
  )
}

function Picker({ onChoose }: { onChoose: (weeks: number) => void }) {
  // Depends on today, so it is left out of the prerendered page and shows after hydration.
  const untilApril = useSyncExternalStore(
    noopSubscribe,
    () => weeksUntil(localDay(), PLANNED_SITTING_MONTH_START),
    () => 0,
  )
  return (
    <section aria-labelledby="weeks-heading" className="space-y-3">
      <h2 id="weeks-heading" className="mb-section-head">
        Hur många veckor vill du plugga?
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PLAN_WEEK_CHOICES.map((n) => (
          <button key={n} type="button" onClick={() => onChoose(n)} className="mb-btn mb-btn--secondary flex-col gap-0 py-3">
            <GfNum value={n} className="text-2xl leading-tight" />
            <span className="text-sm text-ink-2">veckor</span>
          </button>
        ))}
      </div>
      {untilApril > 1 && (
        <button type="button" onClick={() => onChoose(untilApril)} className="mb-btn mb-btn--primary w-full">
          Fram till april 2027 ({untilApril} veckor)
        </button>
      )}
      <p className="text-sm text-ink-3">
        UHR planerar nästa prov till april-maj 2027 men har inte satt något datum. Räkna med att
        planen kan behöva ändras när datumet kommer.
      </p>
    </section>
  )
}

type PlanProps = {
  plan: StudyPlanSettings
  progress: ProgressState
  headingRef: React.RefObject<HTMLHeadingElement | null>
}

function Plan({ plan, progress, headingRef }: PlanProps) {
  const weeks = buildPlan(getAllChapters(), plan.weeks)
  const now = currentWeek(plan, localDay())
  const practised = new Set(progress.quizResults.map((r) => r.slug))
  const visited = new Set(progress.visitedChapters)
  const behind = weeks
    .filter((w) => w.number < now)
    .flatMap((w) => w.chapters)
    .filter((c) => !practised.has(c.slug)).length
  const done = weeks.flatMap((w) => w.chapters).filter((c) => practised.has(c.slug)).length

  return (
    <>
      <section aria-labelledby="plan-heading" className="surface-raised space-y-3 p-5 sm:p-6">
        <h2 id="plan-heading" ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
          Vecka <GfNum value={now} /> av <GfNum value={plan.weeks} />
        </h2>
        <p>
          <GfNum value={done} /> av 13 kapitel övade.{' '}
          {behind > 0 ? (
            <>
              Du har <GfNum value={behind} /> kapitel kvar från tidigare
              veckor.
            </>
          ) : (
            'Du följer planen.'
          )}
        </p>
      </section>

      <ol className="space-y-4">
        {weeks.map((w) => {
          const first = addDays(plan.start, (w.number - 1) * 7)
          const isNow = w.number === now
          return (
            <li
              key={w.number}
              aria-current={isNow ? 'step' : undefined}
              className={`surface-raised space-y-2 p-4 sm:p-5 ${isNow ? 'border-l-4 border-l-accent' : ''}`}
            >
              <h3 className="flex flex-wrap items-baseline justify-between gap-x-3 font-semibold">
                <span>
                  Vecka <GfNum value={w.number} />
                  {isNow && <span className="ml-2 text-sm font-medium text-accent">Nu</span>}
                </span>
                <span className="text-sm font-normal text-ink-3">
                  {formatDay(first)} - {formatDay(addDays(first, 6))}
                </span>
              </h3>
              {w.review ? (
                <p className="text-ink-2">
                  Repetera.{' '}
                  <Link to="/ovning/smart" className="text-accent underline underline-offset-2">
                    Träna smart
                  </Link>{' '}
                  tar först dina fel och frågor som är dags att repetera.
                </p>
              ) : (
                <ul className="divide-y divide-line-strong">
                  {w.chapters.map((c) => {
                    const status = practised.has(c.slug) ? 'Övat' : visited.has(c.slug) ? 'Läst' : null
                    return (
                      <li key={c.slug} className="flex items-center justify-between gap-4 py-1">
                        <Link to={`/kapitel/${c.slug}`} className="mb-link-quiet inline-flex min-h-11 min-w-0 flex-1 items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={`inline-block size-2.5 shrink-0 rounded-full border ${
                              status === 'Övat' ? 'border-accent bg-accent' : 'border-ink-3'
                            }`}
                          />
                          Kapitel {c.number}: {c.title}
                        </Link>
                        <span className="flex shrink-0 items-center gap-4 text-sm">
                          {status && <span className="text-ink-3">{status}</span>}
                          <Link to={`/ovning/${c.slug}`} className="mb-link-quiet inline-flex min-h-11 items-center">
                            Öva<span className="sr-only"> på kapitel {c.number}</span>
                          </Link>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ol>

      <button type="button" onClick={() => saveStudyPlan(undefined)} className="mb-link-quiet inline-flex min-h-11 items-center">
        Gör en ny plan
      </button>
    </>
  )
}
