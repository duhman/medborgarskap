import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from 'posthog-js'
import { isAnalyticsOptedOut } from '../lib/analyticsOptOut'

type AnalyticsProviderProps = {
  children: ReactNode
}

function scheduleDeferred(task: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: 3000 })
    return () => window.cancelIdleCallback(id)
  }
  const timer = window.setTimeout(task, 1)
  return () => window.clearTimeout(timer)
}

function initPostHog(): boolean {
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
  const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

  if (!key || !host) {
    return false
  }

  if (isAnalyticsOptedOut()) {
    return false
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: false,
    capture_pageleave: true,
    capture_performance: true,
    disable_session_recording: true,
    disable_surveys: true,
    enable_heatmaps: false,
    persistence: 'localStorage+cookie',
  })

  return true
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    return scheduleDeferred(() => {
      if (cancelled) {
        return
      }
      if (initPostHog()) {
        setReady(true)
      }
    })
  }, [])

  useEffect(() => {
    if (!ready) {
      return
    }
    posthog.capture('$pageview')
  }, [ready, location.pathname, location.search, location.hash])

  return children
}
