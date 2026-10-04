import { useEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnalyticsProvider } from './components/AnalyticsProvider'
import { Layout } from './components/Layout'
import { BehoverJag } from './pages/BehoverJag'
import { Home } from './pages/Home'
import { KapitelIndex } from './pages/KapitelIndex'
import { KapitelStudy } from './pages/KapitelStudy'
import { Integritet } from './pages/Integritet'
import { Om } from './pages/Om'
import { Villkor } from './pages/Villkor'
import { OvningQuiz } from './pages/OvningQuiz'
import { Provfragor } from './pages/Provfragor'

function FocusMainOnNavigate() {
  const { pathname } = useLocation()
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

    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById('main-content')
      if (main instanceof HTMLElement) {
        main.focus({ preventScroll: true })
      }
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsProvider>
        <FocusMainOnNavigate />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="behover-jag" element={<BehoverJag />} />
            <Route path="kapitel" element={<KapitelIndex />} />
            <Route path="kapitel/:slug" element={<KapitelStudy />} />
            <Route path="ovning/:slug" element={<OvningQuiz />} />
            <Route path="provfragor" element={<Provfragor />} />
            <Route path="om" element={<Om />} />
            <Route path="integritet" element={<Integritet />} />
            <Route path="villkor" element={<Villkor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AnalyticsProvider>
    </BrowserRouter>
  )
}
