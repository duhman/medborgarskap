import { Link } from 'react-router-dom'
import { OfficialSourceCitation } from '../components/SourceCitation'
import { faqEntries } from '../content/faq'

export function VanligaFragor() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Vanliga frågor om medborgarskapsprovet</h1>
        <p className="text-ink/85">
          Korta svar om provet och kraven för svenskt medborgarskap. Varje svar bygger på vad UHR
          och Migrationsverket har publicerat, med länk till källan och datum då vi kontrollerade
          den. Vi är inte en myndighet: kontrollera alltid hos källan innan du fattar beslut.
        </p>
      </header>

      <nav aria-label="Frågor på sidan" className="surface-raised p-5">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {faqEntries.map((f) => (
            <li key={f.id}>
              <a href={`#${f.id}`} className="text-accent underline underline-offset-2">
                {f.question}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {faqEntries.map((f) => (
        <section key={f.id} id={f.id} className="space-y-2" aria-labelledby={`${f.id}-rubrik`}>
          <h2 id={`${f.id}-rubrik`} className="text-xl font-semibold">
            {f.question}
          </h2>
          {f.answer.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <OfficialSourceCitation sources={f.sources} />
        </section>
      ))}

      <section className="surface-raised space-y-2 p-5">
        <h2 className="text-xl font-semibold">Behöver du skriva provet?</h2>
        <p className="text-sm">
          Gå igenom några frågor om ålder och utbildning på{' '}
          <Link to="/behover-jag" className="text-accent underline underline-offset-2">
            Behöver jag provet?
          </Link>{' '}
          eller börja öva direkt med{' '}
          <Link to="/kapitel" className="text-accent underline underline-offset-2">
            kapitlen i Sverige i fokus
          </Link>
          .
        </p>
      </section>
    </article>
  )
}
