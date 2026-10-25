import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { loadAllChapters } from './content/chapters/load'
import { getDocumentDescription } from './lib/documentDescription'
import { getDocumentTitle } from './lib/documentTitle'
import { canonicalUrl } from './lib/routeDocumentMeta'
import { routeJsonLd } from './seo/jsonLd'

export type PrerenderResult = {
  html: string
  title: string
  description: string
  canonical: string
  jsonLd: Record<string, unknown>[]
}

/** Loads every chapter so render() never pauses on one. Call once before rendering. */
export async function preload(): Promise<void> {
  await loadAllChapters()
}

/** Build-time render of one route, used by scripts/prerender.mjs. Never shipped to the browser. */
export function render(pathname: string, lastModified?: string): PrerenderResult {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={pathname}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  )
  return {
    html,
    title: getDocumentTitle(pathname),
    description: getDocumentDescription(pathname),
    canonical: canonicalUrl(pathname),
    jsonLd: routeJsonLd(pathname, lastModified),
  }
}
