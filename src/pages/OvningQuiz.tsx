import { Link, useParams } from 'react-router-dom'
import { QuizRunner } from '../components/QuizRunner'
import { getChapterBySlug } from '../content/chapters/meta'

export function OvningQuiz() {
  const { slug = '' } = useParams()
  const chapter = getChapterBySlug(slug)

  if (!chapter) {
    return (
      <p>
        Quiz hittades inte.{' '}
        <Link to="/kapitel" className="text-accent hover:underline">
          Till kapitel
        </Link>
      </p>
    )
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink/60">Övning</p>
        <h1 className="text-3xl font-semibold">{chapter.title}</h1>
        <p className="text-sm text-ink/70">
          Originalfrågor. Inte kopierade från kommersiella sidor. Facit och förklaring efter
          inlämning.
        </p>
      </header>

      <QuizRunner slug={chapter.slug} chapterTitle={chapter.title} questions={chapter.questions} />

      <Link to={`/kapitel/${chapter.slug}`} className="text-sm text-accent hover:underline">
        Tillbaka till kapitelsidan
      </Link>
    </article>
  )
}
