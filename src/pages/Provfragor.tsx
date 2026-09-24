import { officialLinks } from '../config/status'
import { officialSampleQuestions } from '../content/officialSamples'

export function Provfragor() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">UHR:s exempel på provfrågor</h1>
        <p className="text-ink/85">
          Dessa fem frågor är publicerade av Universitets- och högskolerådet som exempel. De är
          inte våra egna övningsfrågor. UHR anger inte facit på webben.
        </p>
        <p className="text-sm">
          Källa:{' '}
          <a href={officialLinks.faq} className="text-accent hover:underline" target="_blank" rel="noreferrer">
            uhr.se/medborgarskapsprovet/fragor-och-svar
          </a>
        </p>
      </header>

      <ul className="space-y-6">
        {officialSampleQuestions.map((q) => (
          <li key={q.id} className="surface-raised p-5">
            <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wide text-ink/60">
              Officiellt UHR-exempel {q.id}
            </p>
            <p className="mb-4 font-medium">{q.prompt}</p>
            <ol className="space-y-2">
              {q.options.map((opt) => (
                <li key={opt.id} className="rounded border border-line-strong bg-raised px-4 py-2 text-sm">
                  <span className="font-medium">{opt.id}.</span> {opt.text}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-ink/60">{q.note}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}
