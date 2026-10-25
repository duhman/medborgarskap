/*
 * Offline support. Pages and files you have opened stay readable without a connection, so you
 * can keep studying on the bus. Pages always try the network first, so a new deploy shows up as
 * soon as you are online; hashed files under /assets/ never change, so they come from the cache.
 * Only same-origin GET requests are touched (analytics and uhr.se links go straight to the network).
 * Pages opened inside the app (without a full page load) are saved when the app asks, see
 * src/lib/offline.ts.
 */
const PAGES = 'pages-v1'
// v2: v1 could hold an HTML fallback saved under a missing .js name.
const ASSETS = 'assets-v2'
const KEEP = [PAGES, ASSETS]
const MAX_ASSETS = 120
/** On a connection that is up but delivers nothing, show the saved page after this long. */
const NETWORK_TIMEOUT_MS = 4000

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(['/', '/kapitel']))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)))
}

/** Caching is best effort: a full or blocked cache must never break a response that arrived. */
async function store(cacheName, key, response) {
  try {
    const cache = await caches.open(cacheName)
    await cache.put(key, response)
    if (cacheName === ASSETS) await trim(ASSETS, MAX_ASSETS)
  } catch {
    // Quota exceeded or storage blocked.
  }
}

async function assetFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  // Never keep an HTML page (a host fallback for a file that no longer exists) as a script or style.
  const isHtml = (response.headers.get('Content-Type') ?? '').includes('text/html')
  if (response.ok && !isHtml) await store(ASSETS, request, response.clone())
  return response
}

const OFFLINE_PAGE = `<!doctype html><html lang="sv"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Ingen anslutning | Medborgarskap</title>
<style>body{font:18px/1.5 system-ui,sans-serif;max-width:36rem;margin:3rem auto;padding:0 1rem;color:#211d18;background:#faf7f1}
a{color:#2d4a3e}button{font:inherit;min-height:44px;padding:0 1.25rem;margin-right:1rem;border:1px solid currentColor;background:none;color:inherit;cursor:pointer}
@media (prefers-color-scheme:dark){body{color:#f3efe7;background:#1c1a17}a{color:#8fc4a8}}</style></head>
<body><h1>Ingen internetanslutning</h1><p>Den här sidan finns inte sparad på den här enheten än.
Sidor som finns sparade fungerar utan internet, och dina framsteg finns kvar.</p>
<p><button type="button" onclick="location.reload()">Försök igen</button><a href="/kapitel">Till kapitlen</a></p></body></html>`

const offlineResponse = () =>
  new Response(OFFLINE_PAGE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })

async function pageNetworkFirst(event) {
  const url = new URL(event.request.url)
  const key = url.origin + url.pathname
  const network = fetch(event.request).then(async (response) => {
    if (response.ok) await store(PAGES, key, response.clone())
    return response
  })
  // The network finishes in the background either way, so a slow answer still refreshes the copy.
  event.waitUntil(network.catch(() => undefined))
  const timeout = new Promise((resolve) => setTimeout(() => resolve('timeout'), NETWORK_TIMEOUT_MS))
  try {
    const first = await Promise.race([network, timeout])
    if (first !== 'timeout') return first
    const cached = await caches.match(key)
    return cached ?? (await network)
  } catch {
    // Offline: this page if it was saved, else a plain notice (never another page's HTML,
    // which the app could not hydrate).
    return (await caches.match(key)) ?? offlineResponse()
  }
}

/** Saves pages the app opened without a full page load, so a reload offline still works. */
async function savePages(paths) {
  const cache = await caches.open(PAGES)
  await Promise.all(
    paths.map(async (path) => {
      const key = new URL(path, self.location.origin)
      if (key.origin !== self.location.origin) return
      const pageKey = key.origin + key.pathname
      if (await cache.match(pageKey)) return
      try {
        const response = await fetch(pageKey, { credentials: 'same-origin' })
        const isHtml = (response.headers.get('Content-Type') ?? '').includes('text/html')
        if (response.ok && isHtml) await store(PAGES, pageKey, response)
      } catch {
        // Offline right now: the page is saved on a later visit.
      }
    }),
  )
}

self.addEventListener('message', (event) => {
  const data = event.data
  if (data && data.type === 'save-pages' && Array.isArray(data.paths)) {
    event.waitUntil(savePages(data.paths.filter((p) => typeof p === 'string').slice(0, 20)))
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith(pageNetworkFirst(event))
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(assetFirst(request))
  }
})
