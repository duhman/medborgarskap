import { useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnalyticsProvider } from './components/AnalyticsProvider'
import { Layout } from './components/Layout'
import { BehoverJag } from './pages/BehoverJag'
import { Home } from './pages/Home'
import { KapitelIndex } from './pages/KapitelIndex'
import { KapitelStudy } from './pages/KapitelStudy'
import { Integritet } from './pages/Integritet'
import { Om } from './pages/Om'
import { VanligaFragor } from './pages/VanligaFragor'
import { Villkor } from './pages/Villkor'
import { prefetchChaptersWhenIdle, savePageForOffline } from './lib/offline'
import { applyRouteDocumentMeta } from './lib/routeDocumentMeta'
import { syncRouteJsonLd } from './seo/syncJsonLd'
import { OvningBlandat } from './pages/OvningBlandat'
import { OvningMinaFel } from './pages/OvningMinaFel'
import { OvningSmart } from './pages/OvningSmart'
import { OvningSparade } from './pages/OvningSparade'
import { OvningProv } from './pages/OvningProv'
import { OvningQuiz } from './pages/OvningQuiz'
import { Provfragor } from './pages/Provfragor'
import { Studieplan } from './pages/Studieplan'
import { NotFound } from './pages/NotFound'
import { OgPreviewStage } from './pages/OgPreviewStage'

function decodeHash(hash: string): string {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return hash.slice(1)
  }
}

function FocusMainOnNavigate() {
  const { pathname, hash } = useLocation()
  const previousPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = pathname
      return
    }

    if (previousPathnameRef.current === pathname) {
      return
    }

    previousPathnameRef.current = pathname

    // A new page starts at the top, or at the section a link such as /integritet#statistik names.
    // 'instant' skips the smooth scroll set on <html>.
    const target = hash ? document.getElementById(decodeHash(hash)) : null
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById('main-content')
      if (main instanceof HTMLElement) {
        main.focus({ preventScroll: true })
      }
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
    // A hash change on the same page returns early above; the browser handles that scroll.
  }, [pathname, hash])

  return null
}

function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    applyRouteDocumentMeta(pathname)
    syncRouteJsonLd(pathname)
    savePageForOffline(pathname)
    if (/^\/(kapitel|ovning)\/./.test(pathname)) prefetchChaptersWhenIdle()
  }, [pathname])

  return null
}

/** Routes shared by the browser entry and the build-time prerender (src/entry-server.tsx). */
export function AppRoutes() {
  return (
    <AnalyticsProvider>
      <FocusMainOnNavigate />
      <DocumentTitle />
      <Routes>
        <Route path="og-preview/:stage" element={<OgPreviewStage />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="behover-jag" element={<BehoverJag />} />
          <Route path="kapitel" element={<KapitelIndex />} />
          <Route path="kapitel/:slug" element={<KapitelStudy />} />
          <Route path="ovning/blandat" element={<OvningBlandat />} />
          <Route path="ovning/mina-fel" element={<OvningMinaFel />} />
          <Route path="ovning/smart" element={<OvningSmart />} />
          <Route path="ovning/prov" element={<OvningProv />} />
          <Route path="ovning/sparade" element={<OvningSparade />} />
          <Route path="ovning/:slug" element={<OvningQuiz />} />
          <Route path="provfragor" element={<Provfragor />} />
          <Route path="studieplan" element={<Studieplan />} />
          <Route path="vanliga-fragor" element={<VanligaFragor />} />
          <Route path="om" element={<Om />} />
          <Route path="integritet" element={<Integritet />} />
          <Route path="villkor" element={<Villkor />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnalyticsProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
