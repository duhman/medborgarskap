import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TutorHelp } from './TutorHelp'

type FetchCall = Parameters<typeof fetch>

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const availability = { available: true, chapterSlugs: ['landet-sverige'], privacyVersion: '2026-11-01' }
const generated = {
  outcome: 'generated',
  explanation: 'Det här är en extra förklaring.',
  example: 'Ett exempel.',
  checkQuestion: 'Vad tänker du nu?',
  citations: [
    {
      sourceId: 'sverige-i-fokus',
      quote: 'Ett källutdrag.',
      quoteOffset: 1,
      url: 'https://www.uhr.se/',
      authority: 'UHR',
      checkedAt: '2026-11-01',
    },
  ],
  sourceVersion: '2026-11-01',
  sourceHash: 'a'.repeat(64),
}

function json(body: unknown, ok = true) {
  return { ok, json: vi.fn().mockResolvedValue(body) } as unknown as Response
}

let container: HTMLDivElement | undefined
let root: Root | undefined

async function render(questionId = 'k1-q1') {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => {
    root?.render(createElement(TutorHelp, { chapterSlug: 'landet-sverige', questionId, selectedOptionId: 'A', enabled: true }))
  })
  return container
}

async function click(element: Element) {
  await act(async () => element.dispatchEvent(new MouseEvent('click', { bubbles: true })))
}

async function select(element: HTMLSelectElement, value: string) {
  await act(async () => {
    element.value = value
    element.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

async function openAndConsent(host: HTMLElement) {
  await click(host.querySelector('button')!)
  await act(async () => {})
  const checkbox = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!
  await act(async () => checkbox.click())
}

afterEach(async () => {
  await act(async () => root?.unmount())
  container?.remove()
  container = undefined
  root = undefined
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('TutorHelp', () => {
  it('is absent when the public pilot is disabled', async () => {
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    await act(async () => {
      root?.render(createElement(TutorHelp, { chapterSlug: 'landet-sverige', questionId: 'k1-q1', selectedOptionId: 'A', enabled: false }))
    })
    expect(container.textContent).toBe('')
  })

  it('does not POST before an explicit, checked disclosure', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(json(availability))
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await click(host.querySelector('button')!)
    await act(async () => {})
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect((fetchMock.mock.calls[0] as FetchCall)[1]).toMatchObject({ method: 'GET' })
    expect((host.querySelector('button.mb-btn--primary') as HTMLButtonElement).disabled).toBe(true)
    expect(fetchMock.mock.calls.some((call) => (call[1] as RequestInit | undefined)?.method === 'POST')).toBe(false)
  })

  it('retries a rejected availability check without attempting a POST', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(json(availability))
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await click(host.querySelector('button')!)
    await act(async () => {})
    expect(host.textContent).toContain('inte tillgänglig')
    await click(host.querySelector('button.mb-btn--secondary')!)
    await act(async () => {})
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls.every((call) => (call[1] as RequestInit).method === 'GET')).toBe(true)
    expect(host.querySelector('input[type="checkbox"]')).not.toBeNull()
  })

  it('does not enable consent or POST when the privacy version does not match', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ ...availability, privacyVersion: 'older-version' }))
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await click(host.querySelector('button')!)
    await act(async () => {})
    expect(host.querySelector('input[type="checkbox"]')).toBeNull()
    expect(fetchMock.mock.calls.every((call) => (call[1] as RequestInit).method === 'GET')).toBe(true)
  })

  it('sends only the agreed minimal payload after opt-in', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(json(availability)).mockResolvedValueOnce(json(generated))
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await openAndConsent(host)
    await click(host.querySelector('button.mb-btn--primary')!)
    await act(async () => {})
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1]).toEqual([
      '/api/tutor',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ questionId: 'k1-q1', selectedOptionId: 'A', language: 'sv', intent: 'simplify', consent: true, privacyVersion: '2026-11-01' }),
      }),
    ])
    expect(host.textContent).toContain('Det här är en extra förklaring.')
    expect(host.querySelector('h3')?.textContent).toBe('AI-förklaring')
  })

  it('turns an aborted client timeout into a retryable error', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_url, options) => new Promise<Response>((_resolve, reject) => {
      const signal = options?.signal
      if (!signal) {
        reject(new Error('missing abort signal'))
        return
      }
      signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })
    }))
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await click(host.querySelector('button')!)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000)
    })
    expect(host.textContent).toContain('Extra hjälp är inte tillgänglig just nu')
    expect(host.querySelector('button.mb-btn--secondary')?.textContent).toBe('Försök igen')
  })

  it('rejects a non-official citation URL instead of rendering it as a link', async () => {
    const invalidCitation = structuredClone(generated)
    invalidCitation.citations[0].url = 'https://not-an-official-source.example/'
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(json(availability)).mockResolvedValueOnce(json(invalidCitation))
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await openAndConsent(host)
    await click(host.querySelector('button.mb-btn--primary')!)
    await act(async () => {})
    expect(host.textContent).toContain('Extra hjälp är inte tillgänglig just nu')
    expect(host.querySelector('a[href="https://not-an-official-source.example/"]')).toBeNull()
  })

  it('rejects a malformed citation URL', async () => {
    const invalidCitation = structuredClone(generated)
    invalidCitation.citations[0].url = 'not a URL'
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(json(availability)).mockResolvedValueOnce(json(invalidCitation))
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await openAndConsent(host)
    await click(host.querySelector('button.mb-btn--primary')!)
    await act(async () => {})
    expect(host.textContent).toContain('Extra hjälp är inte tillgänglig just nu')
  })

  it('marks only generated English teaching text with English language metadata', async () => {
    const english = { ...generated, explanation: 'This is the extra explanation.', example: 'An example.', checkQuestion: 'What do you think now?' }
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(json(availability)).mockResolvedValueOnce(json(english))
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await openAndConsent(host)
    await select(host.querySelectorAll<HTMLSelectElement>('select')[1], 'en')
    await click(host.querySelector('button.mb-btn--primary')!)
    await act(async () => {})
    expect(host.querySelector('p[lang="en"]')?.textContent).toContain('This is the extra explanation.')
    expect(host.querySelector('h3')?.getAttribute('lang')).toBeNull()
    expect(host.querySelector('li')?.closest('[lang]')).toBeNull()
  })

  it('aborts an in-flight request and ignores a stale completion after the question changes', async () => {
    let resolvePost: ((value: Response) => void) | undefined
    const post = new Promise<Response>((resolve) => {
      resolvePost = resolve
    })
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(json(availability)).mockImplementationOnce(() => post)
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await openAndConsent(host)
    await click(host.querySelector('button.mb-btn--primary')!)
    const signal = (fetchMock.mock.calls[1][1] as RequestInit).signal as AbortSignal
    await act(async () => {
      root?.render(createElement(TutorHelp, { chapterSlug: 'landet-sverige', questionId: 'k1-q2', selectedOptionId: 'B', enabled: true }))
    })
    expect(signal.aborted).toBe(true)
    expect(host.querySelector('input[type="checkbox"]')).toBeNull()
    expect(host.textContent).toContain('Få extra hjälp')
    await act(async () => resolvePost?.(json(generated)))
    expect(host.textContent).not.toContain('Det här är en extra förklaring.')
  })

  it('keeps the next action usable while a tutor request is cancelled', async () => {
    let resolvePost: ((value: Response) => void) | undefined
    const post = new Promise<Response>((resolve) => {
      resolvePost = resolve
    })
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(json(availability)).mockImplementationOnce(() => post)
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await openAndConsent(host)
    await click(host.querySelector('button.mb-btn--primary')!)
    const next = document.createElement('button')
    next.textContent = 'Nästa fråga'
    next.onclick = () => root?.render(createElement(TutorHelp, { chapterSlug: 'landet-sverige', questionId: 'k1-q2', selectedOptionId: 'B', enabled: true }))
    document.body.append(next)
    await click(next)
    expect(host.textContent).toContain('Extra hjälp med frågan')
    await act(async () => resolvePost?.(json(generated)))
    next.remove()
  })

  it('gives an offline error without a POST', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(json(availability))
    vi.stubGlobal('fetch', fetchMock)
    const online = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine')
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    const host = await render()
    await openAndConsent(host)
    await click(host.querySelector('button.mb-btn--primary')!)
    await act(async () => {})
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(host.textContent).toContain('offline')
    delete (navigator as unknown as { onLine?: boolean }).onLine
    if (online) Object.defineProperty(Navigator.prototype, 'onLine', online)
  })

  it('keeps the authored feedback path usable when the tutor rejects a request', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json(availability))
      .mockResolvedValueOnce(json({ error: 'rate_limited' }, false))
    vi.stubGlobal('fetch', fetchMock)
    const host = await render()
    await openAndConsent(host)
    await click(host.querySelector('button.mb-btn--primary')!)
    await act(async () => {})
    expect(host.textContent).toContain('Extra hjälp är inte tillgänglig just nu')
    expect(host.querySelector('button')?.textContent).toBe('Stäng extra hjälp')
  })
})
