import { loadAllChapters } from '../content/chapters/load'

/**
 * Asks the service worker (public/sw.js) to save a page opened inside the app. The worker only
 * sees full page loads, so without this a chapter reached by a link was missing offline.
 */
export function savePageForOffline(pathname: string): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  navigator.serviceWorker.ready
    .then((registration) => registration.active?.postMessage({ type: 'save-pages', paths: [pathname] }))
    .catch(() => undefined)
}

let chaptersRequested = false

/**
 * Once someone studies, fetch every chapter's questions while the browser is idle (about 110 kB),
 * so the mixed quiz and the mistakes list also work offline later.
 */
export function prefetchChaptersWhenIdle(): void {
  if (chaptersRequested || !navigator.onLine) return
  chaptersRequested = true
  const run = () => void loadAllChapters().catch(() => (chaptersRequested = false))
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 10_000 })
  else setTimeout(run, 3000)
}
