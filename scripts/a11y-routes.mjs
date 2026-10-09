import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** All public SPA paths from sitemap.xml (33 today; extend sitemap when routes grow). */
export function getA11yRoutes() {
  const xml = readFileSync(join(root, 'public/sitemap.xml'), 'utf8')
  const routes = [...xml.matchAll(/<loc>https:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => {
    const path = m[1].replace(/\/$/, '') || '/'
    return path === '' ? '/' : path
  })
  const unique = [...new Set(routes)]
  unique.sort((a, b) => a.localeCompare(b))
  return unique
}
