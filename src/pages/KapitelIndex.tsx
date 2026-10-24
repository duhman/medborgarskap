import { Link } from 'react-router-dom'
import { getAllChapters, inledningMp3Url, sverigeIFokusPdfUrl } from '../content/chapters/meta'
import { officialLinks } from '../config/status'
import { ExternalLink } from '../components/ExternalLink'
import { GfNum } from '../components/GfNum'
import { ProgressMeter } from '../components/ProgressMeter'
import { getProgressState, getQuizResult } from '../lib/progress'

export function KapitelIndex() {
  const chapters = getAllChapters()
  const { visitedChapters, quizResults } = getProgressState()
  const chapterSlugs = new Set(chapters.map((c) => c.slug))
  const visitedCount = visitedChapters.filter((slug) => chapterSlugs.has(slug)).length
  const quizCount = quizResults.filter((r) => chapterSlugs.has(r.slug)).length
  const totalChapters = chapters.length

  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold sm:text-4xl">Kapitel i Sverige i fokus</h1>
        <p className="text-lg leading-relaxed text-ink-2">
          Boken har {totalChapters} kapitel. Välj ett kapitel för att läsa en sammanfattning,
          lyssna och öva. Boken och ljudfilerna finns hos UHR.
        </p>
        <ul className="flex flex-wrap gap-x-5 text-[15px]">
          <li>
            <ExternalLink href={sverigeIFokusPdfUrl} className="mb-link-quiet inline-flex min-h-11 items-center">
              Hela boken (PDF)
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={inledningMp3Url} className="mb-link-quiet inline-flex min-h-11 items-center">
              Inledning (MP3)
            </ExternalLink>
          </li>
          <li>
            <ExternalLink
              href={officialLinks.utbildningsmaterial}
              className="mb-link-quiet inline-flex min-h-11 items-center"
            >
              Alla ljudfiler
            </ExternalLink>
          </li>
        </ul>
      </header>

      {(visitedCount > 0 || quizCount > 0) && (
        <section aria-label="Dina framsteg" className="space-y-2">
          <p className="text-sm text-ink-2">
            <GfNum value={quizCount} /> av <GfNum value={totalChapters} /> kapitel övade ·{' '}
            <GfNum value={visitedCount} /> lästa
          </p>
          <ProgressMeter value={quizCount} max={totalChapters} />
        </section>
      )}

      <ol className="surface-raised divide-y divide-line-strong">
        {chapters.map((ch) => {
          const result = getQuizResult(ch.slug)
          const status = result
            ? `Övat, senast ${result.score} av ${result.total} rätt`
            : visitedChapters.includes(ch.slug)
              ? 'Läst, inte övat'
              : 'Inte påbörjat'
          return (
            <li key={ch.slug}>
              <Link
                to={`/kapitel/${ch.slug}`}
                className="group flex items-center gap-4 px-4 py-4 text-ink no-underline transition-colors hover:bg-paper-muted hover:text-ink sm:px-5"
              >
                <GfNum
                  value={ch.number}
                  className="w-7 shrink-0 text-right text-xl leading-none text-ink-3"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{ch.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-sm text-ink-3">
                    <span
                      aria-hidden="true"
                      className={`inline-block size-2.5 shrink-0 rounded-full border ${
                        result ? 'border-accent bg-accent' : 'border-ink-3 bg-transparent'
                      }`}
                    />
                    <span className="sr-only">{status}. </span>
                    <span aria-hidden="true">
                      {result ? (
                        <>
                          Senast <GfNum value={result.score} /> av <GfNum value={result.total} /> rätt
                        </>
                      ) : ch.isStub ? (
                        'Frågor kommer snart'
                      ) : (
                        <>
                          <GfNum value={ch.questions.length} /> frågor
                        </>
                      )}
                    </span>
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-lg text-ink-3 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-ink"
                >
                  →
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </article>
  )
}
