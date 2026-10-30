import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsConfigured, setAnalyticsConsent, useAnalyticsConsent, type AnalyticsConsent } from '../lib/analyticsConsent'

/**
 * Asks once whether visitor statistics may be sent. Nothing is sent before a yes. Sits in the page
 * flow under the menu (not over the content), so it never hides a quiz button. Both answers look
 * the same, so saying no is as easy as saying yes.
 */
export function ConsentBanner() {
  const consent = useAnalyticsConsent()
  const [answered, setAnswered] = useState<AnalyticsConsent | null>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // The buttons are gone after an answer, so focus moves to the confirmation instead of the page.
    if (answered) statusRef.current?.focus()
  }, [answered])

  if (!analyticsConfigured) return null

  if (answered) {
    return (
      <section aria-label="Besöksstatistik" className="border-b border-line-strong bg-paper-muted text-sm">
        <p ref={statusRef} tabIndex={-1} className="mx-auto max-w-3xl px-4 py-3 text-ink-2 outline-none">
          {answered === 'granted' ? 'Tack. Statistik skickas från den här webbläsaren.' : 'Ingen statistik skickas från den här webbläsaren.'}{' '}
          Du kan ändra valet på sidan{' '}
          <Link to="/integritet#statistik" className="mb-link-quiet underline underline-offset-2">
            Integritet
          </Link>
          .
        </p>
      </section>
    )
  }

  // 'unknown' is the prerendered page and hydration; a saved choice means no question.
  if (consent !== null) return null

  function answer(value: AnalyticsConsent) {
    setAnalyticsConsent(value)
    setAnswered(value)
  }

  return (
    <section aria-labelledby="consent-heading" className="border-b border-line-strong bg-paper-muted">
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-4">
        <h2 id="consent-heading" className="font-semibold">
          Får vi räkna besök?
        </h2>
        <p className="text-[0.9375rem] text-ink-2">
          Vi vill se vilka sidor som används och om något går sönder. Då skickas sidvisningar och
          tekniska fel till PostHog i EU, med ett slumpat id. Inga cookies, och aldrig dina svar
          eller din studieplan. Sidan fungerar lika bra om du säger nej.{' '}
          <Link to="/integritet#statistik" className="mb-link-quiet underline underline-offset-2">
            Läs mer
          </Link>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => answer('granted')} className="mb-btn mb-btn--secondary">
            Ja, det går bra
          </button>
          <button type="button" onClick={() => answer('denied')} className="mb-btn mb-btn--secondary">
            Nej tack
          </button>
        </div>
      </div>
    </section>
  )
}
