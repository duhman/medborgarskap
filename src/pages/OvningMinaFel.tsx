import { Suspense, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { GfNum } from '../components/GfNum'
import { QuizRunner } from '../components/QuizRunner'
import { useAllQuestions } from '../content/chapters/load'
import type { QuizQuestion } from '../content/types'
import { getMistakeIds, subscribeProgress } from '../lib/progress'

// Saved ids are joined to a string so the snapshot compares by value between renders.
const readMistakes = () => getMistakeIds().join(',')

export function OvningMinaFel() {
  // The prerendered page has no saved progress, so the server snapshot is null.
  const saved = useSyncExternalStore(subscribeProgress, readMistakes, () => null)

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">Övning</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Öva dina fel</h1>
        <p className="text-ink-2">
          Här samlas frågor som du har svarat fel på i övningarna. En fråga försvinner härifrån när
          du svarar rätt på den. Allt sparas bara i din egen webbläsare, inte hos oss.
        </p>
      </header>

      {saved === null ? null : saved === '' ? (
        <NoMistakes />
      ) : (
        // Questions load only when there is something to practise.
        <Suspense fallback={<p className="text-ink-3">Laddar dina frågor…</p>}>
          <MistakesPractice ids={saved} />
        </Suspense>
      )}

      <p>
        <Link to="/kapitel" className="mb-link-quiet inline-flex min-h-11 items-center">
          Alla kapitel
        </Link>
      </p>
    </article>
  )
}

function NoMistakes() {
  return (
    <p className="surface-raised p-5">
      Du har inga sparade fel just nu. Gör en{' '}
      <Link to="/ovning/blandat" className="text-accent underline underline-offset-2">
        blandad övning
      </Link>{' '}
      eller öva ett{' '}
      <Link to="/kapitel" className="text-accent underline underline-offset-2">
        kapitel
      </Link>
      .
    </p>
  )
}

function MistakesPractice({ ids }: { ids: string }) {
  const [set, setSet] = useState<{ questions: QuizQuestion[]; round: number } | null>(null)
  const allQuestions = useAllQuestions()
  const idSet = new Set(ids.split(','))
  const mistakes = allQuestions.filter((q) => idSet.has(q.id))

  function start() {
    setSet((prev) => ({ questions: mistakes, round: (prev?.round ?? 0) + 1 }))
  }

  if (set) {
    return (
      <QuizRunner
        key={set.round}
        slug="mina-fel"
        chapterTitle="dina fel"
        questions={set.questions}
        saveResult={false}
        autoFocus
      />
    )
  }
  if (mistakes.length === 0) return <NoMistakes />
  return (
    <div className="surface-raised space-y-4 p-5">
      <p className="text-lg">
        Du har <GfNum value={mistakes.length} /> {mistakes.length === 1 ? 'fråga' : 'frågor'} att öva
        på.
      </p>
      <button type="button" onClick={start} className="mb-btn mb-btn--primary">
        Öva på dem nu
      </button>
    </div>
  )
}
