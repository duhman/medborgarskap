const OPT_OUT_STORAGE_KEY = 'medborgarskap-analytics-opt-out'

/** True when the visitor has opted out of product analytics (localStorage). */
export function isAnalyticsOptedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}
