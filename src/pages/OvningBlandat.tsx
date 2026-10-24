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
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink-3">Övning</p>
        <h1 className="text-3xl font-semibold">Blandade frågor från alla kapitel</h1>
        <p className="text-sm text-ink-2">
          Slumpade frågor ur alla <GfNum value={pool.length} /> övningsfrågor, från alla 13 kapitel
          i Sverige i fokus. Det här är inte en kopia av det riktiga provet: UHR har ännu inte
          publicerat antal frågor eller provtid för nästa tillfälle.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        {SIZES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => start(n)}
            className="rounded border border-accent bg-accent px-4 py-3 text-base font-medium text-white sm:px-6"
          >
            {set ? 'Nya' : 'Starta med'} <GfNum value={n} /> frågor
          </button>
        ))}
      </div>

      {set && (
        <QuizRunner
          key={set.round}
          slug="blandat"
          chapterTitle="blandade frågor"
          questions={set.questions}
          saveResult={false}
        />
      )}

      <Link to="/kapitel" className="text-sm text-accent hover:underline">
        Öva kapitel för kapitel
      </Link>
    </article>
  )
}
