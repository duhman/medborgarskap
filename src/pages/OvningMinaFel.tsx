import { Suspense, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { GfNum } from '../components/GfNum'
import { QuizRunner } from '../components/QuizRunner'
import { useAllQuestions } from '../content/chapters/load'
import type { QuizQuestion } from '../content/types'
import { getMistakeIds, subscribeProgress, useProgressState } from '../lib/progress'
import { lastWrongIds, oftenWrongIds } from '../lib/review'

const SET_SIZE = 10

// Saved ids are joined to a string so the snapshot compares by value between renders.
const readMistakes = () => getMistakeIds().join(',')

export function OvningMinaFel() {
  // The prerendered page has no saved progress, so the server snapshot is null.
  const saved = useSyncExternalStore(subscribeProgress, readMistakes, () => null)
  // A round keeps running when its last right answer empties the list, so its result still shows.
  const [practising, setPractising] = useState(false)

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

      {saved === null ? null : saved === '' && !practising ? (
        <NoMistakes />
      ) : (
        // Questions load only when there is something to practise.
        <Suspense fallback={<p className="text-ink-3">Laddar dina frågor…</p>}>
          <MistakesPractice ids={saved} onStart={() => setPractising(true)} />
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

function MistakesPractice({ ids, onStart }: { ids: string; onStart: () => void }) {
  const [set, setSet] = useState<{ questions: QuizQuestion[]; round: number; label: string } | null>(null)
  const allQuestions = useAllQuestions()
  const { history } = useProgressState()
  const idSet = new Set(ids.split(','))
  const mistakes = allQuestions.filter((q) => idSet.has(q.id))
  const byId = new Map(allQuestions.map((q) => [q.id, q]))
  const pick = (list: string[]) => list.map((id) => byId.get(id)).filter((q) => q !== undefined).slice(0, SET_SIZE)
  const often = pick(oftenWrongIds(history))
  const latest = pick(lastWrongIds(history))

  function start(questions = mistakes, label = 'dina fel') {
    onStart()
    setSet((prev) => ({ questions, round: (prev?.round ?? 0) + 1, label }))
  }

  // A new round practises what is still wrong, not the questions answered right last time.
  function retry() {
    if (mistakes.length === 0) setSet(null)
    else start()
  }

  if (set) {
    return (
      <QuizRunner
        key={set.round}
        slug="mina-fel"
        chapterTitle={set.label}
        questions={set.questions}
        saveResult={false}
        onRetry={retry}
        retryLabel="Öva på de fel som är kvar"
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
      <button type="button" onClick={() => start()} className="mb-btn mb-btn--primary">
        Öva på dem nu
      </button>
      {(often.length > 0 || latest.length > 1) && (
        <div className="space-y-2 border-t border-line-strong pt-4">
          <p className="text-sm text-ink-3">Eller ett mindre urval, högst <GfNum value={SET_SIZE} /> frågor:</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {often.length > 0 && (
              <button type="button" onClick={() => start(often, 'oftast fel')} className="mb-btn mb-btn--secondary">
                Oftast fel (<GfNum value={often.length} />)
              </button>
            )}
            {latest.length > 1 && (
              <button type="button" onClick={() => start(latest, 'senaste fel')} className="mb-btn mb-btn--secondary">
                Senaste fel (<GfNum value={latest.length} />)
              </button>
            )}
          </div>
          <p className="text-sm text-ink-3">
            Oftast fel: frågor du svarat fel på minst två gånger, flest fel först. Senaste fel: de du
            senast svarade fel på.
          </p>
        </div>
      )}
    </div>
  )
}
