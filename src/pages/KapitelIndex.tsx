import { Link } from 'react-router-dom'
import { getAllChapters, inledningMp3Url, sverigeIFokusPdfUrl } from '../content/chapters/meta'
import { officialLinks } from '../config/status'
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
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Kapitel i Sverige i fokus</h1>
        <p className="text-ink/85">
          Alla kapitel och ljudfiler kommer från UHR. Vi länkar till PDF och MP3, vi speglar inte
          PDF:en här.
        </p>
        {(visitedCount > 0 || quizCount > 0) && (
          <p className="text-sm text-ink/65">
            {visitedCount}/{totalChapters} kapitel besökta
            {quizCount > 0 ? ` · ${quizCount} quiz genomförda` : ''}
          </p>
        )}
        <p className="flex flex-wrap gap-3 text-sm">
          <a href={sverigeIFokusPdfUrl} className="text-accent hover:underline" target="_blank" rel="noreferrer">
            Hela PDF (UHR)
          </a>
          <a href={inledningMp3Url} className="text-accent hover:underline" target="_blank" rel="noreferrer">
            Inledning (MP3)
          </a>
          <a href={officialLinks.utbildningsmaterial} className="text-accent hover:underline" target="_blank" rel="noreferrer">
            Utbildningsmaterial
          </a>
        </p>
      </header>

      <ul className="surface-raised divide-y divide-line-strong">
        {chapters.map((ch) => {
          const result = getQuizResult(ch.slug)
          return (
            <li key={ch.slug}>
              <Link
                to={`/kapitel/${ch.slug}`}
                className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-paper-muted sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="font-mono text-sm text-ink/50">Kapitel {ch.number}</span>
                  <span className="mt-0.5 block font-medium">{ch.title}</span>
                </span>
                <span className="text-sm text-ink/60">
                  {ch.isStub ? 'Länkar klara, quiz kommer' : `${ch.questions.length} övningsfrågor`}
                  {result ? ` · Senast ${result.score}/${result.total}` : ''}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
