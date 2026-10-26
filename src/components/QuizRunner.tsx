import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { chapterMetaList } from '../content/chapters/meta'
import type { QuizQuestion } from '../content/types'
import { displayOptions, percentCorrect, scoreQuiz, seededRandom, shuffled } from '../lib/quiz'
import {
  clearQuizSession,
  getQuizSessionRaw,
  parseQuizSession,
  recordAnswers,
  saveQuizResult,
  saveQuizSession,
  subscribeProgress,
  type QuizSession,
} from '../lib/progress'
import { reportErrorLinks } from '../lib/report'
import { GfNum } from './GfNum'
import { ListenButton } from './ListenButton'
import { ProgressMeter } from './ProgressMeter'
import { SourceCitation } from './SourceCitation'

type Props = {
  slug: string
  chapterTitle: string
  questions: QuizQuestion[]
  /** Save the score as this chapter's latest result. Off for mixed and mistakes sets. */
  saveResult?: boolean
  /** Focus the first question on mount, for runners that appear after a button press. */
  autoFocus?: boolean
  /** Save an unfinished run so it can be continued later. Defaults to saveResult. */
  persistSession?: boolean
  /** Replaces the built-in retry, for sets that change between rounds (the mistakes list). */
  onRetry?: () => void
  retryLabel?: string
  /** Isolated og:video stage: hide counters, meters and extra chrome. */
  ogPreview?: boolean
}

type OptionId = QuizQuestion['correctOptionId']

const LETTERS = 'ABCD'

/** Meter blocks get too thin past this many questions; use a plain bar instead. */
const MAX_METER_BLOCKS = 20

/** Remembers in this browser that the visitor wants the English explanations open. */
const SHOW_EN_KEY = 'medborgarskap-show-en'

const showEnListeners = new Set<() => void>()
/** Used when storage is blocked, so the choice still lasts for this visit. */
let showEnMemory: boolean | undefined

function subscribeShowEn(listener: () => void): () => void {
  showEnListeners.add(listener)
  return () => showEnListeners.delete(listener)
}

function readShowEn(): boolean {
  if (showEnMemory !== undefined) return showEnMemory
  try {
    return localStorage.getItem(SHOW_EN_KEY) === '1'
  } catch {
    return false
  }
}

function writeShowEn(value: boolean): void {
  try {
    localStorage.setItem(SHOW_EN_KEY, value ? '1' : '0')
    showEnMemory = undefined
  } catch {
    showEnMemory = value
  }
  showEnListeners.forEach((listener) => listener())
}

/** A second click on the same spot right after "Nästa fråga" should not warn about a missing answer. */
const ADVANCE_GUARD_MS = 400

export function QuizRunner({
  slug,
  chapterTitle,
  questions,
  saveResult = true,
  autoFocus = false,
  persistSession = saveResult,
  onRetry,
  retryLabel = 'Gör om i ny ordning',
  ogPreview = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLParagraphElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)
  // Focus moves only after the visitor acts, so on first render only when asked to.
  const focusTarget = useRef<'counter' | 'feedback' | 'result' | null>(autoFocus ? 'counter' : null)
  const advancedAt = useRef(0)

  const [attempt, setAttempt] = useState(0)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<OptionId | undefined>(undefined)
  const [answers, setAnswers] = useState<Record<string, OptionId | undefined>>({})
  const [checked, setChecked] = useState(false)
  const [finished, setFinished] = useState(false)
  // Read after hydration like other saved state: the prerendered page has them closed.
  const showEn = useSyncExternalStore(subscribeShowEn, readShowEn, () => false)
  const [hint, setHint] = useState(false)
  // An unfinished run of this chapter saved in this browser. The prerendered page has none.
  const savedSession = useSyncExternalStore(
    subscribeProgress,
    () => (persistSession ? getQuizSessionRaw(slug) : null),
    () => null,
  )

  useEffect(() => {
    const target = focusTarget.current
    focusTarget.current = null
    if (target === 'feedback') feedbackRef.current?.focus()
    if (target === 'counter' || target === 'result') {
      // The new question or the result starts at the top of the runner, so show it from there.
      // Focusing alone left the counter above the viewport after a long explanation.
      rootRef.current?.scrollIntoView({ block: 'start' })
      const el = target === 'counter' ? counterRef.current : resultRef.current
      el?.focus({ preventScroll: true })
    }
  })

  if (questions.length === 0) {
    return (
      <p className="surface-raised border-dashed p-6 text-ink-2">
        Övningsfrågor för det här kapitlet kommer snart. Under tiden: läs kapitlet i PDF och lyssna
        på MP3 från UHR.
      </p>
    )
  }

  // The first attempt keeps the authored order, so the prerendered page and the client agree.
  const ordered = attempt === 0 ? questions : shuffled(questions, seededRandom(`${slug}:${attempt}`))
  const salt = attempt === 0 ? '' : String(attempt)
  const total = ordered.length
  const q = ordered[index]
  const options = displayOptions(q, salt)
  const answeredSoFar = ordered.slice(0, checked ? index + 1 : index)
  const correctSoFar = answeredSoFar.filter((x) => answers[x.id] === x.correctOptionId).length

  function select(id: OptionId) {
    if (checked) return
    setSelected(id)
    setHint(false)
  }

  function check(choice: OptionId | undefined) {
    const nextAnswers = { ...answers, [q.id]: choice }
    setAnswers(nextAnswers)
    setChecked(true)
    setHint(false)
    recordAnswers([{ id: q.id, correct: choice == null ? null : choice === q.correctOptionId }])
    if (index + 1 === total) {
      // The run is complete once the last answer is in, even if the visitor leaves before
      // pressing "Visa resultat", so save the result now instead of in next().
      if (persistSession) clearQuizSession(slug)
      if (saveResult) {
        const { score } = scoreQuiz(questions, nextAnswers)
        saveQuizResult({ slug, score, total, completedAt: new Date().toISOString() })
      }
    } else if (persistSession) {
      saveQuizSession(slug, {
        attempt,
        index: index + 1,
        answers: nextAnswers,
        savedAt: new Date().toISOString(),
        ids: questions.map((x) => x.id),
      })
    }
    focusTarget.current = 'feedback'
  }

  function next() {
    advancedAt.current = Date.now()
    if (index + 1 < total) {
      setIndex(index + 1)
      setSelected(undefined)
      setChecked(false)
      focusTarget.current = 'counter'
      return
    }
    setFinished(true)
    focusTarget.current = 'result'
  }

  function toggleEn() {
    writeShowEn(!showEn)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (checked) {
      next()
      return
    }
    // An option tapped before the page finished loading is checked in the form but not in state.
    const tapped = new FormData(e.currentTarget as HTMLFormElement).get(q.id)
    const choice = selected ?? (typeof tapped === 'string' ? (tapped as OptionId) : undefined)
    if (choice != null) check(choice)
    // An empty submit right after "Nästa fråga" is the second click of a double click, not a request.
    else if (Date.now() - advancedAt.current >= ADVANCE_GUARD_MS) setHint(true)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (checked || e.altKey || e.ctrlKey || e.metaKey) return
    const key = e.key.toUpperCase()
    const position = LETTERS.indexOf(key) >= 0 ? LETTERS.indexOf(key) : Number(key) - 1
    if (key.length === 1 && position >= 0 && position < options.length) {
      e.preventDefault()
      select(options[position].id)
      document.getElementById(`${q.id}-${options[position].id}`)?.focus()
    }
  }

  function continueSession(session: QuizSession) {
    setAttempt(session.attempt)
    setIndex(session.index)
    setAnswers(session.answers)
    setSelected(undefined)
    setChecked(false)
    focusTarget.current = 'counter'
  }

  function dismissSession() {
    clearQuizSession(slug)
    focusTarget.current = 'counter'
  }

  function handleRetry() {
    if (onRetry) {
      onRetry()
      return
    }
    if (persistSession) clearQuizSession(slug)
    setAttempt((n) => n + 1)
    setIndex(0)
    setSelected(undefined)
    setAnswers({})
    setChecked(false)
    setFinished(false)
    focusTarget.current = 'counter'
  }

  if (finished) {
    const { score } = scoreQuiz(questions, answers)
    const percent = percentCorrect(score, total)
    const missed = ordered.filter((x) => answers[x.id] !== x.correctOptionId)

    return (
      <div ref={rootRef} className="scroll-mt-4 space-y-8">
        <section aria-labelledby="quiz-result" className="space-y-4 border border-ink bg-raised p-5 sm:p-6">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">
            Resultat, {chapterTitle}
          </p>
          <h2 id="quiz-result" ref={resultRef} tabIndex={-1} className="text-3xl font-semibold outline-none">
            <GfNum value={score} /> av <GfNum value={total} /> rätt
          </h2>
          <ProgressMeter value={score} max={total} className={total > MAX_METER_BLOCKS ? 'gap-0' : ''} />
          <p className="text-ink-2">{resultMessage(percent)}</p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button type="button" onClick={handleRetry} className="mb-btn mb-btn--primary">
              {retryLabel}
            </button>
            {missed.length > 0 && slug !== 'mina-fel' && (
              <Link to="/ovning/mina-fel" className="mb-btn mb-btn--secondary">
                Öva dina fel
              </Link>
            )}
          </div>
          <p className="text-sm text-ink-3">
            Frågor du svarar fel på sparas bara i din webbläsare, tills du svarar rätt på dem.
          </p>
        </section>

        {missed.length > 0 && (
          <section aria-labelledby="quiz-review" className="space-y-4">
            <h2 id="quiz-review" className="mb-section-head">
              Gå igenom dina fel
            </h2>
            <ol className="space-y-4">
              {missed.map((x) => {
                const chosen = answers[x.id]
                const opts = displayOptions(x, salt)
                const chosenOpt = opts.find((o) => o.id === chosen)
                const correctOpt = opts.find((o) => o.id === x.correctOptionId)
                const chapter = chapterMetaList.find((c) => c.number === x.source.chapter)
                return (
                  <li key={x.id} className="surface-raised space-y-3 p-4 sm:p-5">
                    <h3 className="text-[1.0625rem] font-semibold leading-snug">{x.prompt}</h3>
                    <dl className="space-y-1 text-[0.9375rem]">
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-ink-3">Ditt svar:</dt>
                        <dd>{chosenOpt ? chosenOpt.text : 'Inget svar'}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-ink-3">Rätt svar:</dt>
                        <dd className="font-medium">{correctOpt?.text}</dd>
                      </div>
                    </dl>
                    <p className="text-[0.9375rem] text-ink-2">{x.explanationSv}</p>
                    <SourceCitation source={x.source} className="text-sm text-ink-3" />
                    {chapter && (
                      <p className="text-sm">
                        <Link to={`/kapitel/${chapter.slug}`} className="mb-link-quiet inline-flex min-h-11 items-center">
                          Läs om det här i kapitel {chapter.number}, {chapter.title}
                        </Link>
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        )}
      </div>
    )
  }

  const chosen = answers[q.id]
  const isCorrect = checked && chosen === q.correctOptionId
  const report = reportErrorLinks(q)
  const isLast = index + 1 === total
  const session = parseQuizSession(savedSession)
  // Offer to continue only before this visit has answered anything.
  const resume =
    session &&
    attempt === 0 &&
    index === 0 &&
    !checked &&
    session.index > 0 &&
    session.index < total &&
    Object.keys(session.answers).every((id) => questions.some((x) => x.id === id))
      ? session
      : null

  // While the visitor decides, the first question stays hidden: answering it would overwrite the
  // saved run without asking.
  if (resume) {
    return (
      <div ref={rootRef} className="scroll-mt-4 space-y-4">
        <section aria-label="Påbörjad övning" className="surface-raised space-y-3 p-4 sm:p-5">
          <p>
            Du har en påbörjad övning. Du kom till fråga <GfNum value={resume.index + 1} /> av{' '}
            <GfNum value={total} />.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => continueSession(resume)} className="mb-btn mb-btn--primary">
              Fortsätt där du slutade
            </button>
            <button type="button" onClick={dismissSession} className="mb-btn mb-btn--secondary">
              Börja från början
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div ref={rootRef} onKeyDown={handleKeyDown} className="scroll-mt-4 space-y-4">
      {!ogPreview && (
        <>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <p ref={counterRef} tabIndex={-1} className="font-medium text-ink outline-none">
                Fråga <GfNum value={index + 1} /> av <GfNum value={total} />
              </p>
              <p className="text-ink-3">
                <GfNum value={correctSoFar} /> rätt
              </p>
            </div>
            {total <= MAX_METER_BLOCKS ? (
              <ProgressMeter value={index + (checked ? 1 : 0)} max={total} />
            ) : (
              <div aria-hidden="true" className="h-2.5 bg-[var(--line)]">
                <div
                  className="h-full bg-accent transition-[width] duration-200"
                  style={{ width: `${((index + (checked ? 1 : 0)) / total) * 100}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <p className="hidden text-sm text-ink-3 sm:block">
              Tips: välj svar med tangenterna A-D och tryck Enter.
            </p>
            <ListenButton
              id={`${q.id}:${attempt}:fraga`}
              parts={[q.prompt, ...options.map((o, i) => `${LETTERS[i]}. ${o.text}`)]}
              label="Lyssna på frågan"
            />
          </div>
        </>
      )}

      {/* method="dialog" outside a dialog submits nowhere, so a tap on Svara before the page has
          finished loading does not reload it with the answer in the address. */}
      <form method="dialog" onSubmit={handleSubmit} noValidate className="space-y-4">
        <fieldset key={`${attempt}-${q.id}`} className="surface-raised space-y-2 p-4 sm:p-5">
          <legend
            className={
              ogPreview
                ? 'og-preview-quiz-legend font-semibold leading-snug'
                : 'text-lg font-semibold leading-snug sm:text-xl'
            }
          >
            {q.prompt}
          </legend>
          {options.map((opt, position) => {
            const id = `${q.id}-${opt.id}`
            const isAnswer = opt.id === q.correctOptionId
            const isChosen = (checked ? chosen : selected) === opt.id
            let state = ''
            if (checked && isAnswer) state = 'mb-choice--correct'
            else if (checked && isChosen) state = 'mb-choice--wrong'
            else if (checked) state = 'mb-choice--muted'
            return (
              <label
                key={opt.id}
                htmlFor={id}
                className={`mb-choice ${state}`}
                {...(ogPreview && opt.id === 'A' && !checked ? { 'data-og-quiz': 'option-A' } : {})}
                {...(ogPreview && checked && isAnswer ? { 'data-og-quiz': 'reveal' } : {})}
              >
                <input
                  id={id}
                  type="radio"
                  name={q.id}
                  value={opt.id}
                  checked={isChosen}
                  disabled={checked}
                  onChange={() => select(opt.id)}
                />
                <span className="w-4 shrink-0 font-mono text-sm font-medium text-ink-3">
                  {LETTERS[position]}
                </span>
                {/* On a phone the tag sits above the text, so long answers keep their width. */}
                <span className="flex flex-1 flex-col-reverse gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="flex-1">{opt.text}</span>
                  {checked && isAnswer && <span className="mb-choice__tag">Rätt svar</span>}
                  {checked && isChosen && !isAnswer && <span className="mb-choice__tag">Ditt svar</span>}
                </span>
              </label>
            )
          })}
        </fieldset>

        {checked && (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            role="status"
            className="space-y-3 border-t border-line-strong pt-4 outline-none"
          >
            <p className={`flex items-center gap-2 font-semibold ${ogPreview ? 'og-preview-feedback-title' : 'text-lg'}`}>
              {isCorrect ? (
                <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 shrink-0 text-[var(--ok)]">
                  <circle cx="6" cy="6" r="6" fill="currentColor" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 shrink-0 text-[var(--error)]">
                  <rect width="12" height="12" fill="currentColor" />
                  <path d="M3 3l6 6M9 3l-6 6" stroke="var(--bg-raised)" strokeWidth="1.5" />
                </svg>
              )}
              {isCorrect ? 'Rätt' : chosen ? 'Inte rätt' : 'Du hoppade över frågan'}
            </p>
            <p className={ogPreview ? 'og-preview-explanation' : undefined}>{q.explanationSv}</p>
            {!ogPreview && (
              <ListenButton
                id={`${q.id}:${attempt}:forklaring`}
                parts={[
                  `Rätt svar: ${q.options.find((o) => o.id === q.correctOptionId)?.text ?? ''}.`,
                  q.explanationSv,
                ]}
                label="Lyssna på förklaringen"
              />
            )}
            <SourceCitation
              source={q.source}
              compact={ogPreview}
              className={ogPreview ? 'og-preview-citation' : 'text-[0.9375rem] text-ink-2'}
            />
            {q.explanationEn && !ogPreview && (
              <div>
                <button
                  type="button"
                  aria-expanded={showEn}
                  className="mb-link-quiet inline-flex min-h-11 items-center text-sm"
                  onClick={toggleEn}
                >
                  {showEn ? 'Dölj förklaring på engelska' : 'Visa förklaring på engelska'}
                  <span lang="en">&nbsp;(English)</span>
                </button>
                {showEn && (
                  <p lang="en" className="text-ink-2">
                    {q.explanationEn}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {hint && (
          <p role="alert" className="text-[0.9375rem] text-[var(--error)]">
            Välj ett svar först, eller hoppa över frågan.
          </p>
        )}

        {/* On a phone the buttons stay in reach at the bottom of the screen while the question shows. */}
        {!ogPreview || !checked ? (
          <div
            className={`flex items-center gap-3 ${ogPreview ? '' : 'max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-4 max-sm:border-t max-sm:border-line-strong max-sm:bg-paper max-sm:px-4 max-sm:py-3'}`}
          >
            <button
              type="submit"
              className="mb-btn mb-btn--primary flex-1 sm:min-w-44 sm:flex-none"
              {...(ogPreview ? { 'data-og-quiz': checked ? 'next' : 'submit' } : {})}
            >
              {checked ? (isLast ? 'Visa resultat' : 'Nästa fråga') : 'Svara'}
            </button>
            {!checked && !ogPreview && (
              <button
                type="button"
                onClick={() => check(undefined)}
                className="mb-btn border-transparent bg-transparent text-ink-2 hover:bg-paper-muted hover:text-ink"
              >
                Hoppa över
              </button>
            )}
          </div>
        ) : null}
        {checked && !ogPreview && (
          <p className="text-sm text-ink-3">
            Hittat ett fel i frågan? Meddela via{' '}
            <a href={report.email} className="mb-link-quiet">
              e-post
            </a>{' '}
            eller{' '}
            <a href={report.github} className="mb-link-quiet" target="_blank" rel="noopener noreferrer">
              GitHub
              <span className="sr-only">, öppnas i ny flik</span>
            </a>
            .
          </p>
        )}
      </form>
    </div>
  )
}

function resultMessage(percent: number): string {
  if (percent >= 90) return 'Mycket bra. Du kan det här väl. Gör om frågorna i ny ordning för att vara säker.'
  if (percent >= 70) return 'Bra. Gå igenom frågorna du svarade fel på nedan och läs de delarna i boken igen.'
  if (percent >= 40)
    return 'Du är på väg. Läs kapitlet en gång till, gärna medan du lyssnar, och öva sedan igen.'
  return 'Börja med att läsa och lyssna på kapitlet. Öva sedan igen. Det blir lättare för varje gång.'
}
