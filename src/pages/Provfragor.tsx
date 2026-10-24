import { officialLinks } from '../config/status'
import { ExternalLink } from '../components/ExternalLink'
import { GfNum } from '../components/GfNum'
import { officialSampleQuestions } from '../content/officialSamples'

export function Provfragor() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">UHR:s exempel på provfrågor</h1>
        <p className="text-lg leading-relaxed text-ink-2">
          Dessa fem frågor är publicerade av Universitets- och högskolerådet som exempel. De är
          inte våra egna övningsfrågor. UHR anger inte facit på webben.
        </p>
        <p className="text-sm">
          Källa:{' '}
          <ExternalLink href={officialLinks.faq}>UHR, Frågor och svar</ExternalLink>
        </p>
      </header>

      <ul className="space-y-6">
        {officialSampleQuestions.map((q) => (
          <li key={q.id} className="surface-raised p-4 sm:p-5">
            <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wide text-ink-3">
              Officiellt UHR-exempel <GfNum value={q.id} />
            </p>
            <p className="mb-4 text-[17px] font-semibold leading-snug">{q.prompt}</p>
            <ol className="space-y-2">
              {q.options.map((opt) => (
                <li
                  key={opt.id}
                  className="flex items-start gap-3 rounded-[2px] border border-line-strong bg-raised px-4 py-3"
                >
                  <span className="font-mono text-sm font-medium leading-6 text-ink-3">{opt.id}</span>
                  <span>{opt.text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-ink-3">{q.note}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}
