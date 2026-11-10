import { chapterMetaList } from '../content/chapters/meta'

type AnalyticsProperties = Record<string, unknown>

export type AnalyticsCapture = {
  event: string
  properties: AnalyticsProperties
  uuid: string
  timestamp?: Date
}

const canonicalOrigin = 'https://provamedborgarskap.se'
const staticPaths = new Set([
  '/',
  '/behover-jag',
  '/kapitel',
  '/ovning/blandat',
  '/ovning/mina-fel',
  '/ovning/smart',
  '/ovning/prov',
  '/ovning/sparade',
  '/provfragor',
  '/studieplan',
  '/vanliga-fragor',
  '/om',
  '/integritet',
  '/villkor',
])
const chapterSlugs = new Set(chapterMetaList.map((chapter) => chapter.slug))
const allowedEvents = new Set(['$pageview', '$pageleave', '$web_vitals', '$exception'])
const metricValue = /^\$web_vitals_(?:CLS|FCP|INP|LCP)_value$/
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Returns only a route that is published by this site, never a URL, query, or hash. */
export function canonicalAnalyticsPath(pathname: string): string | undefined {
  const path = pathname === '/' ? pathname : pathname.replace(/\/+$/, '')
  if (staticPaths.has(path)) return path
  const match = path.match(/^\/(kapitel|ovning)\/([^/]+)$/)
  if (!match || !chapterSlugs.has(match[2])) return undefined
  return path
}

function currentPath(properties: AnalyticsProperties): string | undefined {
  const currentUrl = properties.$current_url
  if (typeof currentUrl === 'string') {
    try {
      const url = new URL(currentUrl, canonicalOrigin)
      if (url.origin === canonicalOrigin) return canonicalAnalyticsPath(url.pathname)
    } catch {
      // An invalid or cross-origin URL is not analytics data we retain.
    }
  }
  return canonicalAnalyticsPath(typeof window === 'undefined' ? '/' : window.location.pathname)
}

function safeIdentifier(value: unknown): string | undefined {
  return typeof value === 'string' && uuid.test(value) ? value : undefined
}

/**
 * The SDK adds browser, URL, referrer and exception fields by default. Build a new allowlisted
 * payload so study content and identifiers cannot enter analytics when a library default changes.
 */
export function sanitizeAnalyticsCapture(capture: AnalyticsCapture | null, consent: boolean): AnalyticsCapture | null {
  if (!consent || !capture || !allowedEvents.has(capture.event)) return null
  const path = currentPath(capture.properties)
  if (!path) return null

  const properties: AnalyticsProperties = { $current_url: `${canonicalOrigin}${path}` }
  for (const key of ['$session_id', '$window_id']) {
    const value = safeIdentifier(capture.properties[key])
    if (value) properties[key] = value
  }
  if (capture.event === '$web_vitals') {
    for (const [key, value] of Object.entries(capture.properties)) {
      if (metricValue.test(key) && typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 900_000) {
        properties[key] = value
      }
    }
  }

  return { ...capture, properties }
}
