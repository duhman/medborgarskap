import { useState } from 'react'
import type { QuizQuestion } from '../content/types'
import { formatSource, scoreQuiz } from '../lib/quiz'
import { saveQuizResult } from '../lib/progress'

type Props = {
  slug: string
  chapterTitle: string
  questions: QuizQuestion[]
}

export function QuizRunner({ slug, chapterTitle, questions }: Props) {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    saveQuizResult({
      slug,
      score,
      total,
      completedAt: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {questions.map((q, index) => {
        const chosen = answers[q.id]
        const isCorrect = submitted && chosen === q.correctOptionId
        const isWrong = submitted && chosen != null && chosen !== q.correctOptionId

        return (
          <fieldset key={q.id} className="surface-raised p-5">
            <legend className="mb-3 font-medium text-ink">
              {index + 1}. {q.prompt}
            </legend>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const id = `${q.id}-${opt.id}`
                const showResult =
                  submitted &&
                  (opt.id === q.correctOptionId || (chosen === opt.id && opt.id !== q.correctOptionId))
                let ring = 'border-line-strong bg-raised hover:border-accent/40'
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
                      <span className="font-medium">{opt.id}.</span> {opt.text}
                    </span>
                  </label>
                )
              })}
            </div>

            {submitted && (
              <div className="mt-4 space-y-2 border-t border-line-strong pt-4 text-sm">
                <p className={isCorrect ? 'text-accent' : isWrong ? 'text-red-800' : 'text-ink/70'}>
                  {isCorrect
                    ? 'Rätt.'
                    : chosen
                      ? 'Inte rätt. Rätt svar är markerat ovan.'
                      : 'Du svarade inte på den här frågan.'}
                </p>
                <p>{q.explanationSv}</p>
                <p className="text-ink/60">{formatSource(q.source)}</p>
                {q.explanationEn && (
                  <div>
                    <button
                      type="button"
                      className="text-xs font-medium text-accent underline-offset-2 hover:underline"
                      onClick={() => setShowEn((s) => ({ ...s, [q.id]: !s[q.id] }))}
                    >
                      {showEn[q.id] ? 'Dölj engelska' : 'Visa engelska'}
                    </button>
                    {showEn[q.id] && <p className="mt-1 text-ink/70">{q.explanationEn}</p>}
                  </div>
                )}
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
        <p className="text-lg font-medium text-ink">
          Resultat för {chapterTitle}: {score} av {total} rätt.
        </p>
      )}
    </form>
  )
}
