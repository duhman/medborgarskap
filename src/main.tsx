import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.tsx'
import { preloadRouteData } from './content/chapters/load'
import './index.css'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Every route is prerendered (scripts/prerender.mjs). Load the chapter this page shows first, so
// hydration reuses the server HTML instead of repainting it. The dev server has an empty #root.
preloadRouteData(window.location.pathname)
  .catch(() => undefined)
  .then(() => {
    if (container.hasChildNodes()) hydrateRoot(container, app)
    else createRoot(container).render(app)
  })

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}
