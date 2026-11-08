import { useSyncExternalStore } from 'react'

/**
 * Visitor statistics (PostHog) run only after the visitor says yes. The choice is kept in
 * localStorage and can be changed on /integritet at any time.
 */
export type AnalyticsConsent = 'granted' | 'denied'

const CONSENT_STORE = 'medborgarskap-analytics-consent-v1'
/** Written by the opt-out checkbox before consent existed (2026-10-30). Counts as a no. */
const LEGACY_OPT_OUT = 'medborgarskap-analytics-opt-out'

const listeners = new Set<() => void>()
/** Used when storage is blocked, so the choice still lasts for this visit. */
let memoryFallback: AnalyticsConsent | undefined

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (memoryFallback !== undefined) return memoryFallback
  try {
    const value = localStorage.getItem(CONSENT_STORE)
    if (value === 'granted' || value === 'denied') return value
    return localStorage.getItem(LEGACY_OPT_OUT) === '1' ? 'denied' : null
  } catch {
    return null
  }
}

/** True only after an explicit yes. */
export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsent() === 'granted'
}

/** Deletes what PostHog stored on this device: its localStorage entry and any old cookie. */
export function purgeAnalyticsStorage(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (/^ph_.+_posthog$/.test(key) || key === '__ph_opt_in_out') localStorage.removeItem(key)
    }
  } catch {
    // Blocked storage: nothing was saved.
  }
  if (typeof document === 'undefined') return
  const host = window.location.hostname
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim()
    if (!name || !/^ph_.+_posthog$/.test(name)) continue
    for (const domain of ['', `; domain=${host}`, `; domain=.${host.replace(/^www\./, '')}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`
    }
  }
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  try {
    localStorage.setItem(CONSENT_STORE, consent)
    localStorage.removeItem(LEGACY_OPT_OUT)
    memoryFallback = undefined
  } catch {
    memoryFallback = consent
  }
  if (consent === 'denied') purgeAnalyticsStorage()
  listeners.forEach((listener) => listener())
}

export function subscribeAnalyticsConsent(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_STORE || e.key === LEGACY_OPT_OUT || e.key === null) listener()
  }
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
  }
}

/** Whether this build sends statistics at all. Without a key there is nothing to ask about. */
export const analyticsConfigured = Boolean(
  import.meta.env.VITE_PUBLIC_POSTHOG_KEY && import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
)

/**
 * The visitor's choice for rendering. 'unknown' in the prerendered page and during hydration, so
 * the banner never appears in server HTML and the first client render matches it.
 */
export function useAnalyticsConsent(): AnalyticsConsent | null | 'unknown' {
  return useSyncExternalStore(subscribeAnalyticsConsent, getAnalyticsConsent, () => 'unknown')
}
