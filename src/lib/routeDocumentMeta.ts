import { getDocumentDescription } from './documentDescription'
import { getDocumentTitle } from './documentTitle'

export const SITE_ORIGIN = 'https://provamedborgarskap.se'

export const SITE_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`

/** Canonical path for provamedborgarskap.se (no trailing slash except home). */
export function canonicalPathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/'
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed.length > 0 ? trimmed : '/'
}

export function canonicalUrl(pathname: string): string {
  const path = canonicalPathname(pathname)
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`
}

function upsertLinkRel(rel: string, href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    document.head.appendChild(link)
  }
  link.href = href
}

function upsertMetaByProperty(property: string, content: string): void {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('property', property)
    document.head.appendChild(meta)
  }
  meta.content = content
}

function upsertMetaByName(name: string, content: string): void {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = name
    document.head.appendChild(meta)
  }
  meta.content = content
}

/** Keep document title and share tags aligned on client-side route changes. */
export function applyRouteDocumentMeta(pathname: string): void {
  const title = getDocumentTitle(pathname)
  const description = getDocumentDescription(pathname)
  const url = canonicalUrl(pathname)

  document.title = title
  upsertLinkRel('canonical', url)
  upsertMetaByName('description', description)
  upsertMetaByName('robots', title.includes('hittades inte') ? 'noindex, follow' : 'index, follow')
  upsertMetaByProperty('og:title', title)
  upsertMetaByProperty('og:description', description)
  upsertMetaByProperty('og:url', url)
  upsertMetaByName('twitter:title', title)
  upsertMetaByName('twitter:description', description)
  upsertMetaByName('twitter:url', url)
  upsertMetaByName('twitter:image', SITE_OG_IMAGE)
  upsertMetaByProperty('og:image', SITE_OG_IMAGE)
  upsertMetaByProperty('og:type', 'website')
  upsertMetaByName('twitter:card', 'summary_large_image')
}
