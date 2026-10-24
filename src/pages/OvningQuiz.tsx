import { Link, useParams } from 'react-router-dom'
import { QuizRunner } from '../components/QuizRunner'
import { getChapterBySlug } from '../content/chapters/meta'

export function OvningQuiz() {
  const { slug = '' } = useParams()
  const chapter = getChapterBySlug(slug)

  if (!chapter) {
    return (
      <p>
        Övningen hittades inte.{' '}
        <Link to="/kapitel" className="text-accent hover:underline">
          Till kapitel
        </Link>
      </p>
    )
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink-3">Övning</p>
        <h1 className="text-3xl font-semibold">{chapter.title}</h1>
        <p className="text-sm text-ink-2">
          Egna frågor som bygger på kapitlet i Sverige i fokus. Efter rättningen ser du förklaring
          och citatet ur materialet som svaret bygger på.
        </p>
      </header>

      <QuizRunner slug={chapter.slug} chapterTitle={chapter.title} questions={chapter.questions} />

      <nav aria-label="Fler övningar" className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
        <Link to={`/kapitel/${chapter.slug}`} className="text-accent hover:underline">
          Tillbaka till kapitelsidan
        </Link>
        <Link to="/ovning/blandat" className="text-accent hover:underline">
          Blandade frågor från alla kapitel
        </Link>
        <Link to="/ovning/mina-fel" className="text-accent hover:underline">
          Öva dina fel
        </Link>
      </nav>
    </article>
  )
}
