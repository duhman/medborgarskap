import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GfNum } from '../components/GfNum'
import { QuizRunner } from '../components/QuizRunner'
import { getAllQuestions } from '../content/chapters/meta'
import type { QuizQuestion } from '../content/types'
import { pickQuestions } from '../lib/quiz'

const SIZES = [10, 20, 40] as const

export function OvningBlandat() {
  const pool = getAllQuestions()
  const [set, setSet] = useState<{ questions: QuizQuestion[]; round: number } | null>(null)

  function start(count: number) {
    setSet((prev) => ({ questions: pickQuestions(pool, count), round: (prev?.round ?? 0) + 1 }))
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">Övning</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Blandade frågor från alla kapitel</h1>
        <p className="text-ink-2">
          Slumpade frågor ur alla <GfNum value={pool.length} /> övningsfrågor, från alla 13 kapitel
          i Sverige i fokus. Det här är inte en kopia av det riktiga provet: UHR har ännu inte
          publicerat antal frågor eller provtid för nästa tillfälle.
        </p>
      </header>

      {!set ? (
        <section aria-labelledby="size-heading" className="space-y-3">
          <h2 id="size-heading" className="mb-section-head">
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
      ) : (
        <>
          <QuizRunner
            key={set.round}
            slug="blandat"
            chapterTitle="blandade frågor"
            questions={set.questions}
            saveResult={false}
          />
          <button
            type="button"
            onClick={() => setSet(null)}
            className="mb-link-quiet inline-flex min-h-11 items-center"
          >
            Börja om med ett annat antal frågor
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
