import { Link, useParams } from 'react-router-dom'
import { GfNum } from '../components/GfNum'
import { QuizRunner } from '../components/QuizRunner'
import { useChapter } from '../content/chapters/load'

export function OvningQuiz() {
  const { slug = '' } = useParams()
  const chapter = useChapter(slug)

  if (!chapter) {
    return (
      <p>
        Övningen hittades inte.{' '}
        <Link to="/kapitel" className="text-accent underline underline-offset-2">
          Till kapitel
        </Link>
      </p>
    )
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">
          <Link to={`/kapitel/${chapter.slug}`} className="mb-link-quiet">
            Kapitel <GfNum value={chapter.number} />
          </Link>{' '}
          · Övning
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">{chapter.title}</h1>
        <p className="text-ink-2">
          Svara på en fråga i taget. Efter varje svar ser du förklaringen och var det står i Sverige
          i fokus.
        </p>
      </header>

      <QuizRunner key={chapter.slug} slug={chapter.slug} chapterTitle={chapter.title} questions={chapter.questions} />

      {chapter.questions.length > 0 && (
        <details className="group border-t border-line-strong pt-2">
          <summary className="flex min-h-11 list-none items-center justify-between gap-3 font-medium">
            <span>
              Alla frågor i övningen (<GfNum value={chapter.questions.length} />)
            </span>
            <span aria-hidden="true" className="text-ink-3 transition-transform duration-150 group-open:rotate-180">
              ▾
            </span>
          </summary>
          <ol className="list-decimal space-y-1 pb-2 pl-6 text-[15px] text-ink-2 marker:font-mono marker:text-ink-3">
            {chapter.questions.map((q) => (
              <li key={q.id}>{q.prompt}</li>
            ))}
          </ol>
        </details>
      )}

      <nav aria-label="Fler övningar" className="space-y-2">
        <p className="mb-section-head">Fortsätt</p>
        <ul className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6">
          <li>
            <Link to={`/kapitel/${chapter.slug}`} className="mb-link-quiet inline-flex min-h-11 items-center">
              Tillbaka till kapitlet
            </Link>
          </li>
          <li>
            <Link to="/ovning/blandat" className="mb-link-quiet inline-flex min-h-11 items-center">
              Blandade frågor från alla kapitel
            </Link>
          </li>
          <li>
            <Link to="/ovning/mina-fel" className="mb-link-quiet inline-flex min-h-11 items-center">
              Öva dina fel
            </Link>
          </li>
        </ul>
      </nav>
    </article>
  )
}
