import { useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { GfNum } from '../components/GfNum'
import { QuizRunner } from '../components/QuizRunner'
import { getAllQuestions } from '../content/chapters/meta'
import type { QuizQuestion } from '../content/types'
import { getMistakeIds, subscribeProgress } from '../lib/progress'

// Saved ids are joined to a string so the snapshot compares by value between renders.
const readMistakes = () => getMistakeIds().join(',')

export function OvningMinaFel() {
  // The prerendered page has no saved progress, so the server snapshot is null.
  const saved = useSyncExternalStore(subscribeProgress, readMistakes, () => null)
  const [set, setSet] = useState<{ questions: QuizQuestion[]; round: number } | null>(null)

  const ids = saved ? new Set(saved.split(',')) : new Set<string>()
  const mistakes = getAllQuestions().filter((q) => ids.has(q.id))

  function start() {
    setSet((prev) => ({ questions: mistakes, round: (prev?.round ?? 0) + 1 }))
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink-3">Övning</p>
        <h1 className="text-3xl font-semibold">Öva dina fel</h1>
        <p className="text-sm text-ink-2">
          Här samlas frågor som du har svarat fel på i övningarna. En fråga försvinner härifrån när
          du svarar rätt på den. Allt sparas bara i din egen webbläsare, inte hos oss.
        </p>
      </header>

      {saved === null ? null : mistakes.length === 0 ? (
        <p className="surface-raised p-5">
          Du har inga sparade fel just nu. Gör en{' '}
          <Link to="/ovning/blandat" className="text-accent hover:underline">
            blandad övning
          </Link>{' '}
          eller öva ett{' '}
          <Link to="/kapitel" className="text-accent hover:underline">
            kapitel
          </Link>
          .
        </p>
      ) : (
        !set && (
          <div className="space-y-3">
            <p>
              Du har <GfNum value={mistakes.length} /> {mistakes.length === 1 ? 'fråga' : 'frågor'}{' '}
              att öva på.
            </p>
            <button
              type="button"
              onClick={start}
              className="rounded border border-accent bg-accent px-6 py-3 text-base font-medium text-white"
            >
              Öva på dem nu
            </button>
          </div>
        )
      )}

      {set && (
        <QuizRunner
          key={set.round}
          slug="mina-fel"
          chapterTitle="dina fel"
          questions={set.questions}
          saveResult={false}
        />
      )}

      <Link to="/kapitel" className="text-sm text-accent hover:underline">
        Alla kapitel
      </Link>
    </article>
  )
}
