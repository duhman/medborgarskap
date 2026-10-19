import { routeJsonLd } from './jsonLd'

/**
 * Keep structured data in step with the page shown after client-side navigation.
 * The prerendered blocks carry data-route; they stay untouched on the page they were built for.
 */
export function syncRouteJsonLd(pathname: string): void {
  const blocks = [...document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')]
  if (blocks.length > 0 && blocks.every((node) => node.dataset.route === pathname)) return
  blocks.forEach((node) => node.remove())
  for (const block of routeJsonLd(pathname)) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.route = pathname
    script.textContent = JSON.stringify(block)
    document.head.appendChild(script)
  }
}
