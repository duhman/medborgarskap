import { useSyncExternalStore } from 'react'

const OPT_OUT_STORAGE_KEY = 'medborgarskap-analytics-opt-out'

const listeners = new Set<() => void>()
/** Used when storage is blocked, so the choice still lasts for this visit. */
let memoryFallback: boolean | undefined

/** True when the visitor has opted out of product analytics (localStorage). */
export function isAnalyticsOptedOut(): boolean {
  if (memoryFallback !== undefined) return memoryFallback
  try {
    return localStorage.getItem(OPT_OUT_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Saves the visitor's choice. Opting out also stops a running analytics client (see AnalyticsProvider). */
export function setAnalyticsOptOut(optedOut: boolean): void {
  try {
    if (optedOut) localStorage.setItem(OPT_OUT_STORAGE_KEY, '1')
    else localStorage.removeItem(OPT_OUT_STORAGE_KEY)
    memoryFallback = undefined
  } catch {
    memoryFallback = optedOut
  }
  listeners.forEach((listener) => listener())
}

export function subscribeAnalyticsOptOut(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === OPT_OUT_STORAGE_KEY || e.key === null) listener()
  }
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
  }
}

/** The visitor's choice for rendering. False in the prerendered page, so hydration matches. */
export function useAnalyticsOptOut(): boolean {
  return useSyncExternalStore(subscribeAnalyticsOptOut, isAnalyticsOptedOut, () => false)
}
