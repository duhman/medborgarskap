import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChapterBySlug, sverigeIFokusPdfUrl } from '../content/chapters/meta'
import { GfNum } from '../components/GfNum'
import { getQuizResult, markChapterVisited } from '../lib/progress'

export function KapitelStudy() {
  const { slug = '' } = useParams()
  const chapter = getChapterBySlug(slug)

  useEffect(() => {
    if (chapter) markChapterVisited(slug)
  }, [chapter, slug])

  if (!chapter) {
    return (
      <p>
        Kapitlet hittades inte.{' '}
        <Link to="/kapitel" className="text-accent hover:underline">
          Tillbaka till listan
        </Link>
      </p>
    )
  }

  const quizResult = getQuizResult(slug)

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-ink/50">
          Kapitel <GfNum value={chapter.number} />
        </p>
        <h1 className="text-3xl font-semibold">{chapter.title}</h1>
      </header>

      <section className="space-y-3 text-ink/85">
        <p>{chapter.intro}</p>
        {chapter.bullets && (
          <ul className="list-disc space-y-1 pl-5">
            {chapter.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <a
          href={sverigeIFokusPdfUrl}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded border border-line-strong bg-raised px-4 py-3 text-center text-sm font-medium"
          target="_blank"
          rel="noreferrer"
        >
          Läs kapitlet i Sverige i fokus (PDF)
        </a>
        <a
          href={chapter.mp3Url}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded border border-line-strong bg-raised px-4 py-3 text-center text-sm font-medium"
          target="_blank"
          rel="noreferrer"
        >
          Lyssna (MP3)
        </a>
      </section>

      <section className="surface-raised p-6">
        <h2 className="text-xl font-semibold">Öva detta kapitel</h2>
        <p className="mt-2 text-sm text-ink/80">
          {chapter.isStub
            ? 'Quiz kommer i en senare uppdatering.'
            : (
                <>
                  <GfNum value={chapter.questions.length} /> egna flervalsfrågor med förklaring och
                  källhänvisning.
                </>
              )}
        </p>
        {quizResult && (
          <p className="mt-1 text-sm text-ink/60">
            Ditt senaste resultat: <GfNum value={quizResult.score} /> av{' '}
            <GfNum value={quizResult.total} /> rätt.
          </p>
        )}
        <Link
          to={`/ovning/${chapter.slug}`}
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded border border-accent bg-accent px-6 py-3 font-medium text-white"
        >
          {chapter.isStub ? 'Visa quiz-sida' : 'Starta quiz'}
        </Link>
      </section>

      <Link to="/kapitel" className="text-sm text-accent hover:underline">
        Alla kapitel
      </Link>
    </article>
  )
}
