import { useEffect, useRef, useState } from 'react'
import { TUTOR_PRIVACY_VERSION } from '../lib/tutor'
import type {
  TutorAvailability,
  TutorCitation,
  TutorIntent,
  TutorLanguage,
  TutorOptionId,
  TutorResponse,
} from '../lib/tutor'

/** The tutor is opt-in at build time, so public builds do not expose its controls. */
export const tutorPilotEnabled = import.meta.env.VITE_PUBLIC_TUTOR_ENABLED === 'true'

type Props = {
  chapterSlug: string
  questionId: string
  selectedOptionId: TutorOptionId | null
  /** Test-only override. Production callers rely on the public build flag above. */
  enabled?: boolean
}

type State = 'closed' | 'checking' | 'ready' | 'requesting' | 'result' | 'unavailable' | 'error'
type RetryAction = 'availability' | 'request'

const OFFICIAL_CITATION_HOSTS = new Set(['www.uhr.se', 'www.iaf.se', 'www.riksdagen.se'])
const CLIENT_REQUEST_TIMEOUT_MS = 15_000

function isOfficialCitationUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && OFFICIAL_CITATION_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

function isAvailability(value: unknown): value is TutorAvailability {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.available === 'boolean' &&
    Array.isArray(candidate.chapterSlugs) &&
    candidate.chapterSlugs.every((slug) => typeof slug === 'string') &&
    typeof candidate.privacyVersion === 'string'
  )
}

function isCitation(value: unknown): value is TutorCitation {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.sourceId === 'string' && candidate.sourceId.length > 0 && candidate.sourceId.length <= 128 &&
    typeof candidate.quote === 'string' && candidate.quote.length > 0 && candidate.quote.length <= 800 &&
    typeof candidate.quoteOffset === 'number' && Number.isSafeInteger(candidate.quoteOffset) && candidate.quoteOffset >= 0 &&
    isOfficialCitationUrl(candidate.url) &&
    typeof candidate.authority === 'string' && candidate.authority.length > 0 && candidate.authority.length <= 160 &&
    (typeof candidate.checkedAt === 'string' || candidate.checkedAt === null)
  )
}

function isTutorResponse(value: unknown): value is TutorResponse {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const common =
    (candidate.outcome === 'generated' || candidate.outcome === 'fallback') &&
    typeof candidate.explanation === 'string' &&
    typeof candidate.sourceVersion === 'string' && candidate.sourceVersion.length > 0 && candidate.sourceVersion.length <= 160 &&
    typeof candidate.sourceHash === 'string' && /^[a-f0-9]{64}$/.test(candidate.sourceHash) &&
    Array.isArray(candidate.citations) && candidate.citations.length > 0 &&
    candidate.citations.every(isCitation)
  if (!common) return false
  if (candidate.outcome === 'fallback') return candidate.example === null && candidate.checkQuestion === null
  return (
    (typeof candidate.example === 'string' || candidate.example === null) &&
    (typeof candidate.checkQuestion === 'string' || candidate.checkQuestion === null)
  )
}

function responseErrorMessage(error: unknown): string {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'Du verkar vara offline. Läs den vanliga förklaringen ovan och försök igen när du har internet.'
  }
  if (error instanceof DOMException && error.name === 'AbortError') return ''
  return 'Extra hjälp är inte tillgänglig just nu. Läs den vanliga förklaringen ovan eller försök igen.'
}

/**
 * A deliberately bounded tutor: it receives only a question id, selected option, language and
 * teaching intent. Lesson text, sources, history and free text never leave this component.
 */
export function TutorHelp({ chapterSlug, questionId, selectedOptionId, enabled = tutorPilotEnabled }: Props) {
  const [state, setState] = useState<State>('closed')
  const [consent, setConsent] = useState(false)
  const [language, setLanguage] = useState<TutorLanguage>('sv')
  const [intent, setIntent] = useState<TutorIntent>('simplify')
  const [answer, setAnswer] = useState<TutorResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryAction, setRetryAction] = useState<RetryAction>('availability')
  const rootRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestTimedOutRef = useRef(false)
  const requestNumber = useRef(0)
  const focusResultRef = useRef(false)
  const [previousQuestionId, setPreviousQuestionId] = useState(questionId)

  const visible = enabled && chapterSlug === 'landet-sverige'

  function cancelRequest() {
    requestNumber.current += 1
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    requestTimedOutRef.current = false
    controllerRef.current?.abort()
    controllerRef.current = null
    focusResultRef.current = false
  }

  if (previousQuestionId !== questionId) {
    setPreviousQuestionId(questionId)
    setState('closed')
    setConsent(false)
    setLanguage('sv')
    setIntent('simplify')
    setAnswer(null)
    setErrorMessage('')
    setRetryAction('availability')
  }

  useEffect(() => cancelRequest, [questionId])

  useEffect(() => {
    if (state !== 'result') return
    const activeElement = document.activeElement
    if (focusResultRef.current && (rootRef.current?.contains(activeElement) || activeElement === document.body)) {
      resultRef.current?.focus()
    }
  }, [state])

  if (!visible) return null

  function startRequest() {
    const controller = new AbortController()
    requestTimedOutRef.current = false
    controllerRef.current = controller
    timeoutRef.current = setTimeout(() => {
      if (controllerRef.current === controller) {
        requestTimedOutRef.current = true
        controller.abort()
      }
    }, CLIENT_REQUEST_TIMEOUT_MS)
    return controller
  }

  function finishRequest(controller: AbortController) {
    if (controllerRef.current !== controller) return
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    controllerRef.current = null
  }

  async function openTutor() {
    cancelRequest()
    setAnswer(null)
    setErrorMessage('')
    setRetryAction('availability')
    setState('checking')
    const currentRequest = ++requestNumber.current
    const controller = startRequest()
    try {
      const response = await fetch('/api/tutor', { method: 'GET', cache: 'no-store', signal: controller.signal })
      const data: unknown = await response.json()
      if (
        !response.ok ||
        !isAvailability(data) ||
        data.privacyVersion !== TUTOR_PRIVACY_VERSION ||
        !data.available ||
        !data.chapterSlugs.includes(chapterSlug)
      ) {
        if (requestNumber.current === currentRequest) setState('unavailable')
        return
      }
      if (requestNumber.current === currentRequest) setState('ready')
    } catch (error) {
      const message = requestTimedOutRef.current
        ? 'Extra hjälp är inte tillgänglig just nu. Läs den vanliga förklaringen ovan eller försök igen.'
        : responseErrorMessage(error)
      if (requestNumber.current === currentRequest && message) {
        setErrorMessage(message)
        setRetryAction('availability')
        setState('error')
      }
    } finally {
      if (requestNumber.current === currentRequest) finishRequest(controller)
    }
  }

  async function askTutor() {
    if (!consent) return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setErrorMessage('Du verkar vara offline. Läs den vanliga förklaringen ovan och försök igen när du har internet.')
      setRetryAction('request')
      setState('error')
      return
    }
    cancelRequest()
    focusResultRef.current = rootRef.current?.contains(document.activeElement) ?? false
    setState('requesting')
    setAnswer(null)
    setErrorMessage('')
    setRetryAction('request')
    const currentRequest = ++requestNumber.current
    const controller = startRequest()
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        cache: 'no-store',
        signal: controller.signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questionId, selectedOptionId, language, intent, consent: true, privacyVersion: TUTOR_PRIVACY_VERSION }),
      })
      const data: unknown = await response.json()
      if (!response.ok || !isTutorResponse(data)) {
        if (requestNumber.current === currentRequest) {
          setErrorMessage('Extra hjälp är inte tillgänglig just nu. Läs den vanliga förklaringen ovan eller försök igen.')
          setRetryAction('request')
          setState('error')
        }
        return
      }
      if (requestNumber.current === currentRequest) {
        setAnswer(data)
        setState('result')
      }
    } catch (error) {
      const message = requestTimedOutRef.current
        ? 'Extra hjälp är inte tillgänglig just nu. Läs den vanliga förklaringen ovan eller försök igen.'
        : responseErrorMessage(error)
      if (requestNumber.current === currentRequest && message) {
        setErrorMessage(message)
        setRetryAction('request')
        setState('error')
      }
    } finally {
      if (requestNumber.current === currentRequest) finishRequest(controller)
    }
  }

  function cancelTutor() {
    cancelRequest()
    setState('ready')
  }

  function closeTutor() {
    cancelRequest()
    setAnswer(null)
    setErrorMessage('')
    setRetryAction('availability')
    setState('closed')
  }

  return (
    <section
      ref={rootRef}
      className="surface-raised space-y-3 p-4 sm:p-5"
      aria-labelledby={`tutor-${questionId}`}
      aria-busy={state === 'checking' || state === 'requesting'}
    >
      <h2 id={`tutor-${questionId}`} className="text-lg font-semibold">
        Extra hjälp med frågan
      </h2>
      {state === 'closed' && (
        <button
          type="button"
          className="mb-btn mb-btn--secondary"
          aria-expanded="false"
          aria-controls={`tutor-content-${questionId}`}
          onClick={openTutor}
        >
          Få extra hjälp
        </button>
      )}

      {state !== 'closed' && (
        <div id={`tutor-content-${questionId}`} className="space-y-3">
          <button
            type="button"
            className="mb-link-quiet inline-flex min-h-11 items-center text-sm"
            aria-expanded="true"
            aria-controls={`tutor-content-${questionId}`}
            onClick={closeTutor}
          >
            Stäng extra hjälp
          </button>

      {state === 'checking' && (
        <p role="status" aria-live="polite" aria-busy="true" className="text-ink-2">
          Kontrollerar om extra hjälp är tillgänglig.
        </p>
      )}

      {state === 'unavailable' && (
        <div className="space-y-3">
          <p role="status" className="text-ink-2">
            Extra hjälp är inte tillgänglig just nu. Den vanliga förklaringen och källan ovan finns kvar.
          </p>
          <button type="button" className="mb-btn mb-btn--secondary" onClick={openTutor}>
            Försök igen
          </button>
        </div>
      )}

      {state === 'ready' && (
        <div className="space-y-3">
          <p className="text-ink-2">
            Extra hjälp använder AI. Till vår tjänst skickas frågans id, ditt valda svar, valt språk och
            hjälpsätt. Tjänsten lägger sedan till den offentliga frågan, svarsalternativen, facit,
            förklaringen och godkända källutdrag innan den frågar OpenAI. Din övriga övningshistorik
            skickas inte. Valet är separat från besöksstatistik och sparas inte i din webbläsare.
          </p>
          <fieldset className="space-y-3">
            <legend className="font-medium">Välj vilken hjälp du vill ha</legend>
            <label className="block space-y-1 text-sm">
              <span>Hjälpsätt</span>
              <select className="min-h-11 border border-line-strong bg-raised px-3" value={intent} onChange={(event) => setIntent(event.target.value as TutorIntent)}>
                <option value="simplify">Förklara enklare</option>
                <option value="misconception">Förklara mitt svarsalternativ</option>
              </select>
            </label>
            <label className="block space-y-1 text-sm">
              <span>Språk</span>
              <select className="min-h-11 border border-line-strong bg-raised px-3" value={language} onChange={(event) => setLanguage(event.target.value as TutorLanguage)}>
                <option value="sv">Svenska</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="mb-choice">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>Jag förstår vad som skickas och vill ha extra hjälp för den här frågan.</span>
            </label>
          </fieldset>
          <button type="button" className="mb-btn mb-btn--primary" onClick={askTutor} disabled={!consent}>
            Be om extra hjälp
          </button>
        </div>
      )}

      {state === 'requesting' && (
        <div className="space-y-3" aria-busy="true">
          <p role="status" aria-live="polite" className="text-ink-2">
            Hämtar extra hjälp med frågan.
          </p>
          <button type="button" className="mb-btn mb-btn--secondary" onClick={cancelTutor}>
            Avbryt
          </button>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-3">
          <p role="status" className="text-ink-2">
            {errorMessage || 'Extra hjälp är inte tillgänglig just nu. Läs den vanliga förklaringen ovan eller försök igen.'}
          </p>
          <button type="button" className="mb-btn mb-btn--secondary" onClick={retryAction === 'availability' ? openTutor : askTutor}>
            Försök igen
          </button>
        </div>
      )}

      {state === 'result' && answer && (
        <div className="space-y-3" aria-live="polite">
          <h3 ref={resultRef} tabIndex={-1} className="text-lg font-semibold outline-none">
            {answer.outcome === 'fallback' ? 'Den vanliga förklaringen' : 'AI-förklaring'}
          </h3>
          <p lang={language}>{answer.explanation}</p>
          {answer.example && <p lang={language}>{answer.example}</p>}
          {answer.checkQuestion && (
            <div className="space-y-1 border-t border-line-strong pt-3">
              <h4 className="font-medium">Tänk efter</h4>
              <p lang={language}>{answer.checkQuestion}</p>
              <p className="text-sm text-ink-3">Detta är en frivillig tankeövning och påverkar inte ditt resultat.</p>
            </div>
          )}
          {answer.citations.length > 0 && (
            <div className="space-y-2 border-t border-line-strong pt-3">
              <h4 className="font-medium">Källor till hjälpen</h4>
              <ul className="space-y-2 text-sm text-ink-2">
                {answer.citations.map((citation) => (
                  <li key={`${citation.sourceId}:${citation.quoteOffset}:${citation.quote}`}>
                    <a href={citation.url} className="mb-link-quiet underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                      {citation.authority}
                      <span className="sr-only">, öppnas i ny flik</span>
                    </a>
                    {citation.checkedAt ? `, kontrollerad ${citation.checkedAt}` : ''}
                    {citation.quote ? `: ${citation.quote}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-ink-3">Källunderlag: {answer.sourceVersion}</p>
        </div>
      )}
        </div>
      )}
    </section>
  )
}
