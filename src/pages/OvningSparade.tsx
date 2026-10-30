import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GfNum } from '../components/GfNum'
import { QuizRunner } from '../components/QuizRunner'
import { useAllQuestions } from '../content/chapters/load'
import { chapterMetaList } from '../content/chapters/meta'
import { toggleBookmark, useProgressState } from '../lib/progress'

export function OvningSparade() {
  const pool = useAllQuestions()
  const { bookmarks } = useProgressState()
  const [round, setRound] = useState(0)
  const byId = new Map(pool.map((q) => [q.id, q]))
  const saved = bookmarks.map((id) => byId.get(id)).filter((q) => q !== undefined)

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">Övning</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Sparade frågor</h1>
        <p className="text-ink-2">
          Frågor du har sparat med Spara frågan under en övning, för att komma tillbaka till dem. De
          sparas bara i din egen webbläsare och ligger kvar tills du tar bort dem.
        </p>
      </header>

      {round > 0 && saved.length > 0 ? (
        <>
          <QuizRunner
            key={round}
            slug="sparade"
            chapterTitle="sparade frågor"
            questions={saved}
            saveResult={false}
            onRetry={() => setRound((n) => n + 1)}
            retryLabel="Öva de sparade igen"
            autoFocus
          />
          <button type="button" onClick={() => setRound(0)} className="mb-link-quiet inline-flex min-h-11 items-center">
            Tillbaka till listan
          </button>
        </>
      ) : saved.length === 0 ? (
        <p className="surface-raised p-5">
          Du har inga sparade frågor. Under en övning finns knappen Spara frågan efter varje svar.{' '}
          <Link to="/kapitel" className="text-accent underline underline-offset-2">
            Välj ett kapitel
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="surface-raised space-y-4 p-5">
            <p className="text-lg">
              Du har <GfNum value={saved.length} /> {saved.length === 1 ? 'sparad fråga' : 'sparade frågor'}.
            </p>
            <button type="button" onClick={() => setRound(1)} className="mb-btn mb-btn--primary">
              Öva de sparade frågorna
            </button>
          </div>
          <ol className="divide-y divide-line-strong">
            {saved.map((q) => {
              const chapter = chapterMetaList.find((c) => c.number === q.source.chapter)
              return (
                <li key={q.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <span>
                    <span className="block">{q.prompt}</span>
                    {chapter && (
                      <Link to={`/kapitel/${chapter.slug}`} className="mb-link-quiet text-sm">
                        Kapitel <GfNum value={chapter.number} />, {chapter.title}
                      </Link>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(q.id)}
                    className="mb-link-quiet inline-flex min-h-11 shrink-0 items-center text-sm"
                  >
                    Ta bort<span className="sr-only">: {q.prompt}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </>
      )}

      <p>
        <Link to="/ovning/mina-fel" className="mb-link-quiet inline-flex min-h-11 items-center">
          Öva dina fel
        </Link>
      </p>
    </article>
  )
}
