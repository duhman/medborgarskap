import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { QuizQuestion } from '../content/types'
import { displayOptions, percentCorrect, scoreQuiz, seededRandom, shuffled } from '../lib/quiz'
import { recordAnswers, saveQuizResult } from '../lib/progress'
import { reportErrorLinks } from '../lib/report'
import { GfNum } from './GfNum'
import { ProgressMeter } from './ProgressMeter'
import { SourceCitation } from './SourceCitation'

type Props = {
  slug: string
  chapterTitle: string
  questions: QuizQuestion[]
  /** Save the score as this chapter's latest result. Off for mixed and mistakes sets. */
  saveResult?: boolean
}

type OptionId = QuizQuestion['correctOptionId']

const LETTERS = 'ABCD'

/** Meter blocks get too thin past this many questions; use a plain bar instead. */
const MAX_METER_BLOCKS = 20

export function QuizRunner({ slug, chapterTitle, questions, saveResult = true }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLParagraphElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)
  // Focus moves only after the visitor acts, never on first render.
  const focusTarget = useRef<'counter' | 'feedback' | 'result' | null>(null)

  const [attempt, setAttempt] = useState(0)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<OptionId | undefined>(undefined)
  const [answers, setAnswers] = useState<Record<string, OptionId | undefined>>({})
  const [checked, setChecked] = useState(false)
  const [finished, setFinished] = useState(false)
  const [showEn, setShowEn] = useState(false)
  const [hint, setHint] = useState(false)

  useEffect(() => {
    const target = focusTarget.current
    focusTarget.current = null
    if (target === 'counter') counterRef.current?.focus()
    if (target === 'feedback') feedbackRef.current?.focus()
    if (target === 'result') resultRef.current?.focus()
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
    setAnswers((prev) => ({ ...prev, [q.id]: choice }))
    setChecked(true)
    setHint(false)
    recordAnswers([{ id: q.id, correct: choice == null ? null : choice === q.correctOptionId }])
    focusTarget.current = 'feedback'
  }

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1)
      setSelected(undefined)
      setChecked(false)
      setShowEn(false)
      focusTarget.current = 'counter'
      return
    }
    setFinished(true)
    focusTarget.current = 'result'
    if (saveResult) {
      const { score } = scoreQuiz(questions, answers)
      saveQuizResult({ slug, score, total, completedAt: new Date().toISOString() })
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (checked) {
      next()
    } else if (selected == null) {
      setHint(true)
    } else {
      check(selected)
    }
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

  function handleRetry() {
    setAttempt((n) => n + 1)
    setIndex(0)
    setSelected(undefined)
    setAnswers({})
    setChecked(false)
    setFinished(false)
    setShowEn(false)
    focusTarget.current = 'counter'
    rootRef.current?.scrollIntoView({ block: 'start' })
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
              Gör om i ny ordning
            </button>
            {missed.length > 0 && (
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
                return (
                  <li key={x.id} className="surface-raised space-y-3 p-4 sm:p-5">
                    <p className="font-semibold leading-snug">{x.prompt}</p>
                    <dl className="space-y-1 text-[15px]">
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-ink-3">Ditt svar:</dt>
                        <dd>{chosenOpt ? chosenOpt.text : 'Inget svar'}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-ink-3">Rätt svar:</dt>
                        <dd className="font-medium">{correctOpt?.text}</dd>
                      </div>
                    </dl>
                    <p className="text-[15px] text-ink-2">{x.explanationSv}</p>
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

  const chosen = answers[q.id]
  const isCorrect = checked && chosen === q.correctOptionId
  const report = reportErrorLinks(q)
  const isLast = index + 1 === total

  return (
    <div ref={rootRef} className="scroll-mt-4 space-y-4">
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

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate className="space-y-4">
        <fieldset key={`${attempt}-${q.id}`} className="surface-raised space-y-2 p-4 sm:p-5">
          <legend className="text-lg font-semibold leading-snug sm:text-xl">{q.prompt}</legend>
          {options.map((opt, position) => {
            const id = `${q.id}-${opt.id}`
            const isAnswer = opt.id === q.correctOptionId
            const isChosen = (checked ? chosen : selected) === opt.id
            let state = ''
            if (checked && isAnswer) state = 'mb-choice--correct'
            else if (checked && isChosen) state = 'mb-choice--wrong'
            else if (checked) state = 'mb-choice--muted'
            return (
              <label key={opt.id} htmlFor={id} className={`mb-choice ${state}`}>
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
                <span className="flex-1">{opt.text}</span>
                {checked && isAnswer && <span className="mb-choice__tag">Rätt svar</span>}
                {checked && isChosen && !isAnswer && <span className="mb-choice__tag">Ditt svar</span>}
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
            <p className="flex items-center gap-2 text-lg font-semibold">
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
            <p>{q.explanationSv}</p>
            <SourceCitation source={q.source} className="text-[15px] text-ink-2" />
            {q.explanationEn && (
              <div>
                <button
                  type="button"
                  aria-expanded={showEn}
                  className="mb-link-quiet inline-flex min-h-11 items-center text-sm"
                  onClick={() => setShowEn((v) => !v)}
                >
                  {showEn ? 'Dölj förklaring på engelska' : 'Visa förklaring på engelska'}
                </button>
                {showEn && (
                  <p lang="en" className="text-ink-2">
                    {q.explanationEn}
                  </p>
                )}
              </div>
            )}
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
          </div>
        )}

        {hint && (
          <p role="alert" className="text-[15px] text-[var(--error)]">
            Välj ett svar först, eller hoppa över frågan.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="mb-btn mb-btn--primary sm:min-w-44">
            {checked ? (isLast ? 'Visa resultat' : 'Nästa fråga') : 'Svara'}
          </button>
          {!checked && (
            <button
              type="button"
              onClick={() => check(undefined)}
              className="mb-btn border-transparent bg-transparent text-ink-2 hover:bg-paper-muted hover:text-ink"
            >
              Hoppa över
            </button>
          )}
        </div>
        <p className="hidden text-sm text-ink-3 sm:block">
          Tips: välj svar med tangenterna A-D och tryck Enter.
        </p>
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
