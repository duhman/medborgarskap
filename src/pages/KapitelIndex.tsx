import { Link } from 'react-router-dom'
import { getAllChapters, inledningMp3Url, sverigeIFokusPdfUrl } from '../content/chapters/meta'
import { officialLinks } from '../config/status'
import { ExternalLink } from '../components/ExternalLink'
import { GfNum } from '../components/GfNum'
import { ProgressMeter } from '../components/ProgressMeter'
import { useProgressState } from '../lib/progress'

export function KapitelIndex() {
  const chapters = getAllChapters()
  const { visitedChapters, quizResults } = useProgressState()
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
        <ul className="flex flex-wrap gap-x-5 text-[0.9375rem]">
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
          const result = quizResults.find((r) => r.slug === ch.slug)
          const visitedOnly = !result && visitedChapters.includes(ch.slug)
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
                    {visitedOnly && <span className="sr-only">Läst, inte övat. </span>}
                    <span>
                      {result ? (
                        <>
                          Senast <GfNum value={result.score} /> av <GfNum value={result.total} /> rätt
                        </>
                      ) : (
                        <>
                          <GfNum value={ch.questionCount} /> frågor
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

      <section aria-labelledby="mixed-heading" className="space-y-3">
        <h2 id="mixed-heading" className="mb-section-head">
          Öva över alla kapitel
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/ovning/smart" className="mb-btn mb-btn--secondary">
            Träna smart
          </Link>
          <Link to="/ovning/blandat" className="mb-btn mb-btn--secondary">
            Blandade frågor
          </Link>
          <Link to="/ovning/mina-fel" className="mb-btn mb-btn--secondary">
            Öva dina fel
          </Link>
        </div>
      </section>
    </article>
  )
}
