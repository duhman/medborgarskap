/*
 * Offline support. Pages and files you have opened stay readable without a connection, so you
 * can keep studying on the bus. Pages always try the network first, so a new deploy shows up as
 * soon as you are online; hashed files under /assets/ never change, so they come from the cache.
 * Only same-origin GET requests are touched (analytics and uhr.se links go straight to the network).
 */
const PAGES = 'pages-v1'
const ASSETS = 'assets-v1'
const KEEP = [PAGES, ASSETS]
const MAX_ASSETS = 120

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
  if (response.ok) await store(ASSETS, request, response.clone())
  return response
}

const OFFLINE_PAGE = `<!doctype html><html lang="sv"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Ingen anslutning | Medborgarskap</title>
<style>body{font:18px/1.5 system-ui,sans-serif;max-width:36rem;margin:3rem auto;padding:0 1rem;color:#211d18;background:#faf7f1}
@media (prefers-color-scheme:dark){body{color:#f3efe7;background:#1c1a17}a{color:#8fc4a8}}</style></head>
<body><h1>Ingen internetanslutning</h1><p>Den här sidan har du inte öppnat tidigare, så den finns inte sparad.
Sidor du redan har besökt fungerar utan internet.</p><p><a href="/kapitel">Till kapitlen</a></p></body></html>`

async function pageNetworkFirst(request) {
  const url = new URL(request.url)
  const key = url.origin + url.pathname
  let response
  try {
    response = await fetch(request)
  } catch {
    // Offline: this page if it was visited, else a plain notice (never another page's HTML,
    // which the app could not hydrate).
    return (
      (await caches.match(key)) ??
      new Response(OFFLINE_PAGE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    )
  }
  if (response.ok) await store(PAGES, key, response.clone())
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith(pageNetworkFirst(request))
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(assetFirst(request))
  }
})
