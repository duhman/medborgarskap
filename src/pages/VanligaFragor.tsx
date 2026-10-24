import { Link } from 'react-router-dom'
import { OfficialSourceCitation } from '../components/SourceCitation'
import { faqEntries } from '../content/faq'

export function VanligaFragor() {
  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold sm:text-4xl">Vanliga frågor om medborgarskapsprovet</h1>
        <p className="text-lg leading-relaxed text-ink-2">
          Korta svar om provet och kraven för svenskt medborgarskap. Varje svar bygger på vad UHR
          och Migrationsverket har publicerat, med länk till källan och datum då vi kontrollerade
          den. Vi är inte en myndighet: kontrollera alltid hos källan innan du fattar beslut.
        </p>
      </header>

      <nav aria-labelledby="faq-toc" className="space-y-2">
        <h2 id="faq-toc" className="mb-section-head">
          Frågor på sidan
        </h2>
        <ul className="divide-y divide-[var(--line)]">
          {faqEntries.map((f) => (
            <li key={f.id}>
              <a
                href={`#${f.id}`}
                className="group flex min-h-12 items-center justify-between gap-3 py-2 text-ink no-underline hover:text-ink"
              >
                <span className="group-hover:underline">{f.question}</span>
                <span aria-hidden="true" className="text-ink-3">
                  ↓
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        {faqEntries.map((f) => (
          <section
            key={f.id}
            id={f.id}
            className="scroll-mt-6 space-y-3"
            aria-labelledby={`${f.id}-rubrik`}
          >
            <h2 id={`${f.id}-rubrik`} className="text-xl font-semibold leading-snug sm:text-2xl">
              {f.question}
            </h2>
            {f.answer.map((p) => (
              <p key={p} className="leading-relaxed">
                {p}
              </p>
            ))}
            <OfficialSourceCitation sources={f.sources} className="space-y-1 text-sm text-ink-3" />
          </section>
        ))}
      </div>

      <section aria-labelledby="faq-next" className="space-y-3 border border-ink bg-raised p-5 sm:p-6">
        <h2 id="faq-next" className="text-xl font-semibold">
          Behöver du skriva provet?
        </h2>
        <p className="text-ink-2">
          Svara på några frågor om ålder och utbildning, eller börja öva direkt med kapitlen i
          Sverige i fokus.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/kapitel" className="mb-btn mb-btn--primary">
            Börja studera
          </Link>
          <Link to="/behover-jag" className="mb-btn mb-btn--secondary">
            Behöver jag provet?
          </Link>
        </div>
      </section>
    </article>
  )
}
