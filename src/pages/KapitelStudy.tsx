import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChapterBySlug, SOURCE_PDF_VERSION, sverigeIFokusPdfUrl } from '../content/chapters/meta'
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
        <p className="text-sm text-ink-3">
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

      {chapter.summaryEasy && chapter.summaryEasy.length > 0 && (
        <section className="space-y-3" aria-labelledby="latt-svenska">
          <h2 id="latt-svenska" className="text-xl font-semibold">
            Kapitlet på lätt svenska
          </h2>
          {chapter.summaryEasy.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="text-sm text-ink-3">
            En kort sammanfattning med enkla ord. Läs också kapitlet i Sverige i fokus, eftersom
            provet bygger på det.
          </p>
        </section>
      )}

      {chapter.glossary && chapter.glossary.length > 0 && (
        <section className="space-y-3" aria-labelledby="viktiga-ord">
          <h2 id="viktiga-ord" className="text-xl font-semibold">
            Viktiga ord
          </h2>
          <dl className="space-y-3">
            {chapter.glossary.map((g) => (
              <div key={g.term}>
                <dt className="font-medium">{g.term}</dt>
                <dd>{g.sv}</dd>
                <dd lang="en" className="text-sm text-ink-2">
                  English: {g.en}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

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
        {chapter.review && (
          <p className="mt-1 text-sm text-ink-3">
            {chapter.review.pdfVersion === SOURCE_PDF_VERSION
              ? `Frågorna granskades senast ${chapter.review.reviewedAt} mot Sverige i fokus, version ${chapter.review.pdfVersion}.`
              : `UHR har publicerat en ny version av materialet. Frågorna granskades mot version ${chapter.review.pdfVersion} och ses över.`}
          </p>
        )}
        {quizResult && (
          <p className="mt-1 text-sm text-ink-3">
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
