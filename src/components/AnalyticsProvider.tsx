import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { PostHog } from 'posthog-js'
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

/** Loads posthog-js only when analytics will run, so it stays out of the first page load. */
async function initPostHog(): Promise<PostHog | null> {
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
  const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

  if (!key || !host) {
    return null
  }

  if (isAnalyticsOptedOut()) {
    return null
  }

  const { default: posthog } = await import('posthog-js')
  // The visitor may have opted out while the library was loading.
  if (isAnalyticsOptedOut()) {
    return null
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

  return posthog
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation()
  const [posthog, setPostHog] = useState<PostHog | null>(null)

  useEffect(() => {
    let cancelled = false
    const cancelTask = scheduleDeferred(() => {
      initPostHog()
        .then((client) => {
          if (!cancelled && client) setPostHog(client)
        })
        .catch(() => {
          // Blocked by an ad blocker or offline: the site works the same without analytics.
        })
    })
    return () => {
      cancelled = true
      cancelTask()
    }
  }, [])

  useEffect(() => {
    if (!posthog) return
    posthog.capture('$pageview')
  }, [posthog, location.pathname, location.search, location.hash])

  return children
}
