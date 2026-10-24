import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { QuizQuestion } from '../content/types'
import { displayOptions, scoreQuiz, seededRandom, shuffled } from '../lib/quiz'
import { recordAnswers, saveQuizResult } from '../lib/progress'
import { reportErrorLinks } from '../lib/report'
import { GfNum } from './GfNum'
import { SourceCitation } from './SourceCitation'

type Props = {
  slug: string
  chapterTitle: string
  questions: QuizQuestion[]
  /** Save the score as this chapter's latest result. Off for mixed and mistakes sets. */
  saveResult?: boolean
}

export function QuizRunner({ slug, chapterTitle, questions, saveResult = true }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [attempt, setAttempt] = useState(0)
  const [answers, setAnswers] = useState<Record<string, QuizQuestion['correctOptionId'] | undefined>>(
    {},
  )
  const [submitted, setSubmitted] = useState(false)
  const [showEn, setShowEn] = useState<Record<string, boolean>>({})

  if (questions.length === 0) {
    return (
      <p className="surface-raised border-dashed p-6 text-ink/75">
        Övningsfrågor för det här kapitlet kommer snart. Under tiden: läs kapitlet i PDF och lyssna
        på MP3 från UHR.
      </p>
    )
  }

  const { score, total } = scoreQuiz(questions, answers)
  // The first attempt keeps the authored order, so the prerendered page and the client agree.
  const ordered = attempt === 0 ? questions : shuffled(questions, seededRandom(`${slug}:${attempt}`))
  const salt = attempt === 0 ? '' : String(attempt)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    recordAnswers(
      questions.map((q) => ({
        id: q.id,
        correct: answers[q.id] == null ? null : answers[q.id] === q.correctOptionId,
      })),
    )
    if (saveResult) {
      saveQuizResult({
        slug,
        score,
        total,
        completedAt: new Date().toISOString(),
      })
    }
  }

  function handleRetry() {
    setAttempt((n) => n + 1)
    setAnswers({})
    setShowEn({})
    setSubmitted(false)
    formRef.current?.scrollIntoView({ block: 'start' })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {ordered.map((q, index) => {
        const chosen = answers[q.id]
        const isCorrect = submitted && chosen === q.correctOptionId
        const isWrong = submitted && chosen != null && chosen !== q.correctOptionId
        const options = displayOptions(q, salt)
        const report = reportErrorLinks(q)

        return (
          <fieldset key={q.id} className="surface-raised p-5">
            <legend className="mb-3 font-medium text-ink">
              <GfNum value={index + 1} />. {q.prompt}
            </legend>
            <div className="space-y-2">
              {options.map((opt, position) => {
                const id = `${q.id}-${opt.id}`
                const showResult =
                  submitted &&
                  (opt.id === q.correctOptionId || (chosen === opt.id && opt.id !== q.correctOptionId))
                let ring = 'border-line-strong bg-raised'
                if (showResult && opt.id === q.correctOptionId) ring = 'border-accent bg-accent-soft'
                if (showResult && chosen === opt.id && isWrong) ring = 'border-red-700/50 bg-red-50'

                return (
                  <label
                    key={opt.id}
                    htmlFor={id}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded border px-4 py-3 transition-colors ${ring}`}
                  >
                    <input
                      id={id}
                      type="radio"
                      name={q.id}
                      value={opt.id}
                      checked={chosen === opt.id}
                      disabled={submitted}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                      className="size-4 shrink-0 accent-accent"
                    />
                    <span>
                      <span className="font-medium">{'ABCD'[position]}.</span> {opt.text}
                    </span>
                  </label>
                )
              })}
            </div>

            {submitted && (
              <div className="mt-4 space-y-2 border-t border-line-strong pt-4 text-sm">
                <p className={isCorrect ? 'text-accent' : isWrong ? 'text-red-800' : 'text-ink-2'}>
                  {isCorrect
                    ? 'Rätt.'
                    : chosen
                      ? 'Inte rätt. Rätt svar är markerat ovan.'
                      : 'Du svarade inte på den här frågan.'}
                </p>
                <p>{q.explanationSv}</p>
                <SourceCitation source={q.source} />
                {q.explanationEn && (
                  <div>
                    <button
                      type="button"
                      className="text-xs font-medium text-accent underline-offset-2 hover:underline"
                      onClick={() => setShowEn((s) => ({ ...s, [q.id]: !s[q.id] }))}
                    >
                      {showEn[q.id] ? 'Dölj engelska' : 'Visa engelska'}
                    </button>
                    {showEn[q.id] && (
                      <p lang="en" className="mt-1 text-ink-2">
                        {q.explanationEn}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-ink-3">
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
          </fieldset>
        )
      })}

      {!submitted ? (
        <button
          type="submit"
          className="w-full rounded border border-accent bg-accent px-4 py-3 text-base font-medium text-white sm:w-auto sm:px-8"
        >
          Rätta svar
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-lg font-medium text-ink" role="status">
            Resultat för {chapterTitle}: <GfNum value={score} /> av <GfNum value={total} /> rätt.
          </p>
          <p className="text-sm text-ink-2">
            Frågor du svarade fel på sparas i din webbläsare under{' '}
            <Link to="/ovning/mina-fel" className="mb-link-quiet">
              Öva dina fel
            </Link>
            , tills du svarar rätt på dem.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="w-full rounded border border-line-strong bg-raised px-4 py-3 text-base font-medium sm:w-auto sm:px-8"
          >
            Gör om i ny ordning
          </button>
        </div>
      )}
    </form>
  )
}
