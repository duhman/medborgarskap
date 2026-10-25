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

async function assetFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(ASSETS)
    await cache.put(request, response.clone())
    trim(ASSETS, MAX_ASSETS)
  }
  return response
}

async function pageNetworkFirst(request) {
  const url = new URL(request.url)
  const key = url.origin + url.pathname
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(PAGES)
      await cache.put(key, response.clone())
    }
    return response
  } catch {
    // Offline: this page if it was visited, else the start page (the app then renders the route).
    return (await caches.match(key)) ?? (await caches.match(url.origin + '/')) ?? Response.error()
  }
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
