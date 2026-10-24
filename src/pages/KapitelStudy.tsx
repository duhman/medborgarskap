import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  chapterPageRanges,
  getAllChapters,
  getChapterBySlug,
  pdfPageUrl,
  SOURCE_PDF_VERSION,
} from '../content/chapters/meta'
import { ExternalLink } from '../components/ExternalLink'
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
        <Link to="/kapitel" className="text-accent underline underline-offset-2">
          Tillbaka till listan
        </Link>
      </p>
    )
  }

  const quizResult = getQuizResult(slug)
  const chapters = getAllChapters()
  const position = chapters.findIndex((c) => c.slug === chapter.slug)
  const prev = chapters[position - 1]
  const next = chapters[position + 1]
  const pages = chapterPageRanges[chapter.number]

  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink-3">
          Kapitel <GfNum value={chapter.number} /> av <GfNum value={chapters.length} />
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">{chapter.title}</h1>
        <p className="text-lg leading-relaxed text-ink-2">{chapter.intro}</p>
      </header>

      <section aria-labelledby="listen-read" className="space-y-4">
        <h2 id="listen-read" className="mb-section-head">
          Lyssna och läs
        </h2>
        <div className="space-y-2">
          <p className="text-[15px] text-ink-2">Kapitlet uppläst av UHR</p>
          <audio controls preload="none" src={chapter.mp3Url} className="w-full">
            <a href={chapter.mp3Url}>Ladda ner ljudfilen (MP3)</a>
          </audio>
        </div>
        <ul className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6">
          <li>
            <ExternalLink
              href={pdfPageUrl(pages?.[0])}
              className="mb-link-quiet inline-flex min-h-11 items-center"
            >
              Läs kapitlet i Sverige i fokus
              {pages && (
                <>
                  {' '}
                  (sidorna {pages[0]}-{pages[1]})
                </>
              )}
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={chapter.mp3Url} className="mb-link-quiet inline-flex min-h-11 items-center">
              Öppna ljudfilen (MP3)
            </ExternalLink>
          </li>
        </ul>
      </section>

      {chapter.bullets && (
        <section aria-labelledby="key-points" className="space-y-3">
          <h2 id="key-points" className="mb-section-head">
            Det viktigaste
          </h2>
          <ul className="list-disc space-y-2 pl-5 marker:text-ink-3">
            {chapter.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      )}

      {chapter.summaryEasy && chapter.summaryEasy.length > 0 && (
        <section className="space-y-3" aria-labelledby="latt-svenska">
          <h2 id="latt-svenska" className="mb-section-head">
            Kapitlet på lätt svenska
          </h2>
          {chapter.summaryEasy.map((p) => (
            <p key={p} className="text-lg leading-relaxed">
              {p}
            </p>
          ))}
          <p className="text-sm text-ink-3">
            En kort sammanfattning med enkla ord. Läs också kapitlet i Sverige i fokus, eftersom
            provet bygger på det.
          </p>
        </section>
      )}

      {chapter.glossary && chapter.glossary.length > 0 && (
        <section className="space-y-3" aria-labelledby="viktiga-ord">
          <h2 id="viktiga-ord" className="mb-section-head">
            Viktiga ord
          </h2>
          <dl className="divide-y divide-[var(--line)]">
            {chapter.glossary.map((g) => (
              <div key={g.term} className="space-y-0.5 py-3 first:pt-0">
                <dt className="font-semibold">{g.term}</dt>
                <dd>{g.sv}</dd>
                <dd lang="en" className="text-sm text-ink-3">
                  English: {g.en}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section aria-labelledby="practice" className="space-y-3 border border-ink bg-raised p-5 sm:p-6">
        <h2 id="practice" className="text-xl font-semibold">
          Öva kapitlet
        </h2>
        <p className="text-ink-2">
          {chapter.isStub ? (
            'Frågor kommer i en senare uppdatering.'
          ) : (
            <>
              <GfNum value={chapter.questions.length} /> frågor, en i taget, med förklaring efter
              varje svar.
            </>
          )}
        </p>
        {quizResult && (
          <p className="text-sm text-ink-3">
            Ditt senaste resultat: <GfNum value={quizResult.score} /> av{' '}
            <GfNum value={quizResult.total} /> rätt.
          </p>
        )}
        <Link to={`/ovning/${chapter.slug}`} className="mb-btn mb-btn--primary w-full sm:w-auto sm:px-8">
          {chapter.isStub ? 'Visa övningssidan' : quizResult ? 'Öva igen' : 'Börja öva'}
        </Link>
        {chapter.review && (
          <p className="text-sm text-ink-3">
            {chapter.review.pdfVersion === SOURCE_PDF_VERSION
              ? `Frågorna granskades senast ${chapter.review.reviewedAt} mot Sverige i fokus, version ${chapter.review.pdfVersion}.`
              : `UHR har publicerat en ny version av materialet. Frågorna granskades mot version ${chapter.review.pdfVersion} och ses över.`}
          </p>
        )}
      </section>

      <nav aria-label="Andra kapitel" className="grid gap-3 border-t border-line-strong pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            to={`/kapitel/${prev.slug}`}
            className="group flex min-h-12 flex-col justify-center text-ink no-underline hover:text-ink"
          >
            <span className="text-sm text-ink-3">
              <span aria-hidden="true">← </span>Kapitel <GfNum value={prev.number} />
            </span>
            <span className="font-medium group-hover:underline">{prev.title}</span>
          </Link>
        ) : (
          <Link to="/kapitel" className="mb-link-quiet inline-flex min-h-12 items-center">
            Alla kapitel
          </Link>
        )}
        {next && (
          <Link
            to={`/kapitel/${next.slug}`}
            className="group flex min-h-12 flex-col justify-center text-ink no-underline hover:text-ink sm:items-end sm:text-right"
          >
            <span className="text-sm text-ink-3">
              Kapitel <GfNum value={next.number} />
              <span aria-hidden="true"> →</span>
            </span>
            <span className="font-medium group-hover:underline">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
