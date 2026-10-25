import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { GfNum } from '../components/GfNum'
import { QuizRunner } from '../components/QuizRunner'
import { ReadinessBar } from '../components/ReadinessBar'
import { useAllQuestions } from '../content/chapters/load'
import { getAllChapters } from '../content/chapters/meta'
import type { QuizQuestion } from '../content/types'
import {
  clearQuizSession,
  getQuizSessionRaw,
  localDay,
  parseQuizSession,
  subscribeProgress,
  useProgressState,
} from '../lib/progress'
import { chapterNumberOfId, countDue, pickSmartQuestions, readiness } from '../lib/review'

const SIZES = [10, 20, 40] as const
const SLUG = 'smart'

function questionsFromSession(raw: string, pool: QuizQuestion[]): QuizQuestion[] | null {
  const ids = parseQuizSession(raw)?.ids
  if (!ids || ids.length === 0) return null
  const byId = new Map(pool.map((q) => [q.id, q]))
  const questions = ids.map((id) => byId.get(id))
  return questions.every((q) => q !== undefined) ? (questions as QuizQuestion[]) : null
}

export function OvningSmart() {
  const pool = useAllQuestions()
  const { history } = useProgressState()
  const [set, setSet] = useState<{ questions: QuizQuestion[]; round: number } | null>(null)
  const sizeHeadingRef = useRef<HTMLHeadingElement>(null)
  const returningToPicker = useRef(false)

  // An unfinished smart round comes back with the same questions, as in the mixed quiz.
  const savedSession = useSyncExternalStore(subscribeProgress, () => getQuizSessionRaw(SLUG), () => null)
  if (set === null && savedSession) {
    const restored = questionsFromSession(savedSession, pool)
    if (restored) setSet({ questions: restored, round: 1 })
  }

  useEffect(() => {
    if (set === null && returningToPicker.current) {
      returningToPicker.current = false
      sizeHeadingRef.current?.focus()
    }
  }, [set])

  function start(count: number) {
    clearQuizSession(SLUG)
    setSet((prev) => ({
      questions: pickSmartQuestions(pool, history, count, localDay()),
      round: (prev?.round ?? 0) + 1,
    }))
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">Övning</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Träna smart</h1>
        <p className="text-ink-2">
          Här får du först frågor som du har svarat fel på, och frågor som är dags att repetera. En
          fråga du svarar rätt på kommer tillbaka efter en dag, sedan efter tre dagar, en vecka och
          så vidare. Resten av frågorna är nya för dig. Allt sparas bara i din egen webbläsare.
        </p>
      </header>

      {!set ? (
        <>
          <Overview pool={pool} />
          <section aria-labelledby="size-heading" className="space-y-3">
            <h2 id="size-heading" ref={sizeHeadingRef} tabIndex={-1} className="mb-section-head outline-none">
              Hur många frågor?
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {SIZES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => start(n)}
                  className="mb-btn mb-btn--secondary flex-col gap-0 py-3"
                >
                  <GfNum value={n} className="text-2xl leading-tight" />
                  <span className="text-sm text-ink-2">frågor</span>
                </button>
              ))}
            </div>
          </section>
          <ChapterReadiness />
        </>
      ) : (
        <>
          <QuizRunner
            key={set.round}
            slug={SLUG}
            chapterTitle="smart träning"
            questions={set.questions}
            saveResult={false}
            persistSession
            onRetry={() => start(set.questions.length)}
            retryLabel="Ny omgång"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              returningToPicker.current = true
              clearQuizSession(SLUG)
              setSet(null)
            }}
            className="mb-link-quiet inline-flex min-h-11 items-center"
          >
            Tillbaka till översikten
          </button>
        </>
      )}

      <p>
        <Link to="/kapitel" className="mb-link-quiet inline-flex min-h-11 items-center">
          Öva kapitel för kapitel
        </Link>
      </p>
    </article>
  )
}

/** How ready the visitor is over the whole book. Empty in the prerendered page. */
function Overview({ pool }: { pool: QuizQuestion[] }) {
  const { history } = useProgressState()
  const all = readiness(history, null, pool.length)
  const answered = all.total - all.new
  const ids = Object.keys(history).filter((id) => chapterNumberOfId(id) !== null)
  const due = countDue(ids, history, localDay())

  return (
    <section aria-labelledby="overview-heading" className="surface-raised space-y-4 p-5 sm:p-6">
      <h2 id="overview-heading" className="text-lg font-semibold">
        Ditt läge
      </h2>
      {answered === 0 ? (
        <p className="text-ink-2">
          Du har inte svarat på några frågor än. Börja med en omgång nedan, så ser du här hur långt
          du har kommit.
        </p>
      ) : (
        <>
          <p>
            <GfNum value={all.known} /> av <GfNum value={all.total} /> frågor sitter säkert.
          </p>
          <ReadinessBar readiness={all} />
          <ul className="space-y-1 text-sm text-ink-2">
            <li>
              Säkra (rätt minst två gånger i rad): <GfNum value={all.known} />
            </li>
            <li>
              Rätt en gång: <GfNum value={all.learning} />
            </li>
            <li>
              Fel senast: <GfNum value={all.wrong} />
            </li>
            <li>
              Inte övade än: <GfNum value={all.new} />
            </li>
          </ul>
          <p className="border-t border-line-strong pt-4 font-medium">
            {due === 0 ? (
              'Inga frågor att repetera i dag. Öva på nya frågor.'
            ) : (
              <>
                <GfNum value={due} /> {due === 1 ? 'fråga' : 'frågor'} att repetera i dag.
              </>
            )}
          </p>
        </>
      )}
    </section>
  )
}

function ChapterReadiness() {
  const { history } = useProgressState()
  const chapters = getAllChapters()
  if (Object.keys(history).length === 0) return null
  return (
    <section aria-labelledby="chapters-heading" className="space-y-3">
      <h2 id="chapters-heading" className="mb-section-head">
        Per kapitel
      </h2>
      <ol className="surface-raised divide-y divide-line-strong">
        {chapters.map((ch) => {
          const r = readiness(history, ch.number, ch.questionCount)
          return (
            <li key={ch.slug}>
              <Link
                to={`/ovning/${ch.slug}`}
                className="block space-y-2 px-4 py-3 text-ink no-underline hover:bg-paper-muted hover:text-ink sm:px-5"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">
                    <GfNum value={ch.number} />. {ch.title}
                  </span>
                  <span className="shrink-0 text-sm text-ink-2">
                    <GfNum value={r.known} /> av <GfNum value={r.total} /> säkra
                  </span>
                </span>
                <ReadinessBar readiness={r} />
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
