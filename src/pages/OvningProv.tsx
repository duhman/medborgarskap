import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { GfNum } from '../components/GfNum'
import { SourceCitation } from '../components/SourceCitation'
import { uhrStatus } from '../config/status'
import { useAllQuestions } from '../content/chapters/load'
import { chapterMetaList } from '../content/chapters/meta'
import type { QuizQuestion } from '../content/types'
import {
  addExamResult,
  clearExamSession,
  EXAM_SIZES,
  examMinutes,
  formatTimeLeft,
  getExamHistory,
  getExamHistoryRaw,
  getExamSessionRaw,
  msLeft,
  parseExamSession,
  pickExamQuestions,
  saveExamSession,
  scoreExam,
  subscribeExam,
  type ExamScore,
  type ExamSession,
  type OptionId,
} from '../lib/exam'
import { recordAnswers } from '../lib/progress'
import { displayOptions } from '../lib/quiz'

const LETTERS = 'ABCD'

/** Warn once when this little time is left. */
const WARN_MS = 5 * 60_000

export function OvningProv() {
  const pool = useAllQuestions()
  const savedRaw = useSyncExternalStore(subscribeExam, getExamSessionRaw, () => null)
  const session = parseExamSession(savedRaw)
  const [finished, setFinished] = useState<{ questions: QuizQuestion[]; answers: ExamSession['answers']; timed: boolean } | null>(null)

  const byId = new Map(pool.map((q) => [q.id, q]))
  const running = session && !finished ? session.ids.map((id) => byId.get(id)).filter((q): q is QuizQuestion => !!q) : null
  const brokenSession = session && running && running.length !== session.ids.length

  function start(count: number, timed: boolean) {
    const questions = pickExamQuestions(pool, count)
    const now = new Date()
    const deadline = timed ? new Date(now.getTime() + examMinutes(questions.length) * 60_000).toISOString() : null
    setFinished(null)
    saveExamSession({ ids: questions.map((q) => q.id), answers: {}, index: 0, startedAt: now.toISOString(), deadline })
  }

  function submit(s: ExamSession, questions: QuizQuestion[]) {
    const { score } = scoreExam(questions, s.answers)
    addExamResult({ finishedAt: new Date().toISOString(), score, total: questions.length, timed: s.deadline !== null })
    // Right and wrong answers feed the mistakes list and smart practice, like other rounds.
    recordAnswers(questions.map((q) => ({ id: q.id, correct: s.answers[q.id] === undefined ? null : s.answers[q.id] === q.correctOptionId })))
    setFinished({ questions, answers: s.answers, timed: s.deadline !== null })
    clearExamSession()
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">Övning</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Provsimulering</h1>
        <p className="text-ink-2">
          Frågor från alla 13 kapitel, i bokens ordning, utan facit förrän du lämnar in. Du kan gå
          fram och tillbaka och ändra dina svar. Det här är en övning, inte en kopia av provet:{' '}
          {uhrStatus.notes}
        </p>
      </header>

      {finished ? (
        <Result
          questions={finished.questions}
          answers={finished.answers}
          onAgain={() => setFinished(null)}
        />
      ) : session && running && !brokenSession ? (
        <Running session={session} questions={running} onSubmit={() => submit(session, running)} onAbort={clearExamSession} />
      ) : (
        <Picker onStart={start} brokenSession={!!brokenSession} />
      )}

      <p>
        <Link to="/kapitel" className="mb-link-quiet inline-flex min-h-11 items-center">
          Öva kapitel för kapitel
        </Link>
      </p>
    </article>
  )
}

function Picker({ onStart, brokenSession }: { onStart: (count: number, timed: boolean) => void; brokenSession: boolean }) {
  const [timed, setTimed] = useState(true)
  const historyRaw = useSyncExternalStore(subscribeExam, getExamHistoryRaw, () => null)
  const history = historyRaw ? getExamHistory() : []

  return (
    <>
      <section aria-labelledby="size-heading" className="space-y-3">
        <h2 id="size-heading" className="mb-section-head">
          Hur många frågor?
        </h2>
        {brokenSession && (
          <p role="status" className="text-ink-2">
            Ett påbörjat prov kunde inte återställas efter att frågorna uppdaterats. Börja ett nytt.
          </p>
        )}
        <label className="mb-choice">
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
          <span>
            Med klocka, <GfNum value="1,5" /> minuter per fråga. Provet lämnas in automatiskt när tiden är ute.
          </span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {EXAM_SIZES.map((n) => (
            <button key={n} type="button" onClick={() => onStart(n, timed)} className="mb-btn mb-btn--secondary flex-col gap-0 py-3">
              <GfNum value={n} className="text-2xl leading-tight" />
              <span className="text-sm text-ink-2">{timed ? `frågor, ${examMinutes(n)} min` : 'frågor'}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-3">
          UHR har inte publicerat antal frågor, provtid eller godkäntgräns för nästa prov, så vi
          visar ingen gräns för godkänt. Resultatet visar hur du ligger till per kapitel.
        </p>
      </section>

      {history.length > 0 && (
        <section aria-labelledby="history-heading" className="space-y-3">
          <h2 id="history-heading" className="mb-section-head">
            Dina tidigare prov
          </h2>
          <ol className="surface-raised divide-y divide-line-strong text-[0.9375rem]">
            {history.map((r) => (
              <li key={r.finishedAt} className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="text-ink-2">
                  <GfNum value={formatDay(r.finishedAt)} />
                  {r.timed ? ', med klocka' : ''}
                </span>
                <span className="font-medium">
                  <GfNum value={r.score} /> av <GfNum value={r.total} /> rätt
                </span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-ink-3">Sparas bara i den här webbläsaren, de tio senaste.</p>
        </section>
      )}
    </>
  )
}

function formatDay(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

type RunningProps = {
  session: ExamSession
  questions: QuizQuestion[]
  onSubmit: () => void
  onAbort: () => void
}

function Running({ session, questions, onSubmit, onAbort }: RunningProps) {
  const total = questions.length
  const index = Math.min(session.index, total - 1)
  const q = questions[index]
  const options = displayOptions(q, session.startedAt)
  const answered = questions.filter((x) => session.answers[x.id] !== undefined).length
  const [confirming, setConfirming] = useState(false)
  const [overview, setOverview] = useState(false)
  const headingRef = useRef<HTMLParagraphElement>(null)
  // The size buttons unmount when the exam starts, so the counter takes focus on mount.
  const focusHeading = useRef(true)

  useEffect(() => {
    if (focusHeading.current) {
      focusHeading.current = false
      headingRef.current?.focus({ preventScroll: true })
      headingRef.current?.scrollIntoView({ block: 'start' })
    }
  })

  function update(patch: Partial<ExamSession>) {
    saveExamSession({ ...session, ...patch })
  }

  function go(to: number) {
    focusHeading.current = true
    setOverview(false)
    update({ index: Math.max(0, Math.min(total - 1, to)) })
  }

  function choose(id: OptionId) {
    update({ answers: { ...session.answers, [q.id]: id } })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <p ref={headingRef} tabIndex={-1} className="font-medium text-ink outline-none">
          Fråga <GfNum value={index + 1} /> av <GfNum value={total} />
        </p>
        <p className="text-ink-3">
          <GfNum value={answered} /> besvarade
        </p>
        <Clock deadline={session.deadline} onExpire={onSubmit} />
      </div>
      <div aria-hidden="true" className="h-2.5 bg-[var(--line)]">
        <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${(answered / total) * 100}%` }} />
      </div>

      <fieldset key={q.id} className="surface-raised space-y-2 p-4 sm:p-5">
        <legend className="text-lg font-semibold leading-snug sm:text-xl">{q.prompt}</legend>
        {options.map((opt, position) => {
          const id = `prov-${q.id}-${opt.id}`
          return (
            <label key={opt.id} htmlFor={id} className="mb-choice">
              <input
                id={id}
                type="radio"
                name={`prov-${q.id}`}
                value={opt.id}
                checked={session.answers[q.id] === opt.id}
                onChange={() => choose(opt.id)}
              />
              <span className="w-4 shrink-0 font-mono text-sm font-medium text-ink-3">{LETTERS[position]}</span>
              <span className="flex-1">{opt.text}</span>
            </label>
          )
        })}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-4 max-sm:border-t max-sm:border-line-strong max-sm:bg-paper max-sm:px-4 max-sm:py-3">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="mb-btn mb-btn--secondary disabled:opacity-50">
          Föregående
        </button>
        {index + 1 < total ? (
          <button type="button" onClick={() => go(index + 1)} className="mb-btn mb-btn--primary flex-1 sm:flex-none sm:min-w-44">
            Nästa
          </button>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="mb-btn mb-btn--primary flex-1 sm:flex-none sm:min-w-44">
            Lämna in
          </button>
        )}
        <button type="button" onClick={() => setOverview((v) => !v)} aria-expanded={overview} className="mb-link-quiet inline-flex min-h-11 items-center">
          Alla frågor
        </button>
      </div>

      {overview && (
        <nav aria-label="Hoppa till fråga" className="surface-raised p-4">
          <ol className="grid grid-cols-6 gap-2 sm:grid-cols-10">
            {questions.map((x, i) => {
              const done = session.answers[x.id] !== undefined
              return (
                <li key={x.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === index ? 'true' : undefined}
                    aria-label={`Fråga ${i + 1}${done ? ', besvarad' : ', obesvarad'}`}
                    className={`gf-num flex min-h-11 w-full items-center justify-center border text-sm ${
                      i === index ? 'border-ink' : 'border-line-strong'
                    } ${done ? 'bg-accent text-accent-on' : 'bg-raised'}`}
                  >
                    {i + 1}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      {confirming ? (
        <section role="alertdialog" aria-labelledby="confirm-heading" className="surface-raised space-y-3 border-ink p-4 sm:p-5">
          <p id="confirm-heading" className="font-semibold">
            {answered < total ? (
              <>
                Du har <GfNum value={total - answered} /> obesvarade frågor. Lämna in ändå?
              </>
            ) : (
              'Lämna in provet?'
            )}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onSubmit} className="mb-btn mb-btn--primary">
              Lämna in och se resultat
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="mb-btn mb-btn--secondary">
              Fortsätt svara
            </button>
          </div>
        </section>
      ) : (
        <p className="flex flex-wrap gap-x-5 text-sm">
          {index + 1 < total && (
            <button type="button" onClick={() => setConfirming(true)} className="mb-link-quiet inline-flex min-h-11 items-center">
              Lämna in nu
            </button>
          )}
          <button type="button" onClick={onAbort} className="mb-link-quiet inline-flex min-h-11 items-center">
            Avbryt provet
          </button>
        </p>
      )}
    </div>
  )
}

/**
 * Counts down once a second. The visible clock is never announced; a separate status line says
 * "fem minuter kvar" and "en minut kvar" once each, so a screen reader is not read the time
 * every second. Hands in at zero.
 */
function Clock({ deadline, onExpire }: { deadline: string | null; onExpire: () => void }) {
  const [left, setLeft] = useState(() => msLeft(deadline))
  const expired = useRef(false)

  useEffect(() => {
    if (deadline === null) return
    const tick = () => {
      const ms = msLeft(deadline)
      setLeft(ms)
      if (ms !== null && ms <= 0 && !expired.current) {
        expired.current = true
        onExpire()
      }
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [deadline, onExpire])

  if (left === null) return null
  const low = left <= WARN_MS
  const notice = left <= 60_000 ? 'En minut kvar.' : low ? 'Fem minuter kvar.' : ''
  return (
    <p className={`gf-num tabular-nums ${low ? 'font-semibold text-[var(--error)]' : 'text-ink-2'}`}>
      <span className="sr-only">Tid kvar: </span>
      <span role="timer" aria-live="off" aria-atomic="true">
        {formatTimeLeft(left)}
      </span>
      <span role="status" className="sr-only">
        {notice}
      </span>
    </p>
  )
}

type ResultProps = {
  questions: QuizQuestion[]
  answers: ExamSession['answers']
  onAgain: () => void
}

function Result({ questions, answers, onAgain }: ResultProps) {
  const result: ExamScore = scoreExam(questions, answers)
  const missed = questions.filter((x) => answers[x.id] !== x.correctOptionId)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="space-y-8">
      <section aria-labelledby="exam-result" className="space-y-4 border border-ink bg-raised p-5 sm:p-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">Resultat, provsimulering</p>
        <h2 id="exam-result" ref={headingRef} tabIndex={-1} className="text-3xl font-semibold outline-none">
          <GfNum value={result.score} /> av <GfNum value={result.total} /> rätt
        </h2>
        {result.unanswered > 0 && (
          <p className="text-ink-2">
            <GfNum value={result.unanswered} /> {result.unanswered === 1 ? 'fråga lämnades' : 'frågor lämnades'} obesvarad
            {result.unanswered === 1 ? '' : 'e'}.
          </p>
        )}
        <p className="text-sm text-ink-3">
          UHR sätter gränsen för godkänt i efterhand, så vi visar ingen. Se i stället vilka kapitel som
          behöver mer tid.
        </p>
        <table className="w-full text-left text-[0.9375rem]">
          <caption className="sr-only">Rätt per kapitel</caption>
          <thead>
            <tr className="text-sm text-ink-3">
              <th scope="col" className="py-1 font-medium">
                Kapitel
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Rätt
              </th>
            </tr>
          </thead>
          <tbody>
            {result.byChapter.map((row) => {
              const chapter = chapterMetaList.find((c) => c.number === row.chapter)
              return (
                <tr key={row.chapter} className="border-t border-line-strong">
                  <td className="py-1.5">
                    {chapter ? (
                      <Link to={`/kapitel/${chapter.slug}`} className="mb-link-quiet">
                        <GfNum value={row.chapter} />. {chapter.title}
                      </Link>
                    ) : (
                      <GfNum value={row.chapter} />
                    )}
                  </td>
                  <td className="py-1.5 text-right">
                    <GfNum value={row.score} /> av <GfNum value={row.total} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="button" onClick={onAgain} className="mb-btn mb-btn--primary">
            Nytt prov
          </button>
          {missed.length > 0 && (
            <Link to="/ovning/mina-fel" className="mb-btn mb-btn--secondary">
              Öva dina fel
            </Link>
          )}
        </div>
      </section>

      {missed.length > 0 && (
        <section aria-labelledby="exam-review" className="space-y-4">
          <h2 id="exam-review" className="mb-section-head">
            Gå igenom dina fel
          </h2>
          <ol className="space-y-4">
            {missed.map((x) => {
              const chosen = x.options.find((o) => o.id === answers[x.id])
              const correct = x.options.find((o) => o.id === x.correctOptionId)
              return (
                <li key={x.id} className="surface-raised space-y-3 p-4 sm:p-5">
                  <h3 className="text-[1.0625rem] font-semibold leading-snug">{x.prompt}</h3>
                  <dl className="space-y-1 text-[0.9375rem]">
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-ink-3">Ditt svar:</dt>
                      <dd>{chosen ? chosen.text : 'Inget svar'}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-ink-3">Rätt svar:</dt>
                      <dd className="font-medium">{correct?.text}</dd>
                    </div>
                  </dl>
                  <p className="text-[0.9375rem] text-ink-2">{x.explanationSv}</p>
                  <SourceCitation source={x.source} className="text-sm text-ink-3" />
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </div>
  )
}
