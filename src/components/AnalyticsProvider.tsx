import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { PostHog } from 'posthog-js'
import { isAnalyticsOptedOut, subscribeAnalyticsOptOut } from '../lib/analyticsOptOut'

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
    // Uncaught errors and unhandled rejections, so a page that breaks for visitors shows up
    // somewhere (there is no other runtime log for a static site).
    capture_exceptions: true,
    disable_session_recording: true,
    disable_surveys: true,
    enable_heatmaps: false,
    // localStorage only: the privacy page promises no cookies.
    persistence: 'localStorage',
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

  // Opting out on the privacy page stops the running client at once; opting back in resumes it.
  useEffect(() => {
    if (!posthog) return
    const apply = () => {
      if (isAnalyticsOptedOut()) posthog.opt_out_capturing()
      else if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing()
    }
    apply()
    return subscribeAnalyticsOptOut(apply)
  }, [posthog])

  useEffect(() => {
    if (!posthog) return
    posthog.capture('$pageview')
  }, [posthog, location.pathname, location.search, location.hash])

  return children
}
