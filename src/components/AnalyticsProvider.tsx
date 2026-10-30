import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { PostHog } from 'posthog-js'
import { hasAnalyticsConsent, subscribeAnalyticsConsent } from '../lib/analyticsConsent'

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

  // Nothing is loaded or sent before the visitor says yes (ConsentBanner, /integritet).
  if (!hasAnalyticsConsent()) {
    return null
  }

  const { default: posthog } = await import('posthog-js')
  // The visitor may have said no while the library was loading.
  if (!hasAnalyticsConsent()) {
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
    // A last guard: drop anything captured after the visitor said no.
    before_send: (event) => (hasAnalyticsConsent() ? event : null),
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

  // A no stops the running client at once. A later yes resumes it, or starts it when this page
  // load began without consent.
  useEffect(() => {
    let cancelled = false
    const apply = () => {
      if (!hasAnalyticsConsent()) {
        posthog?.opt_out_capturing()
      } else if (posthog) {
        if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing({ captureEventName: false })
      } else {
        initPostHog()
          .then((client) => {
            if (!cancelled && client) setPostHog(client)
          })
          .catch(() => undefined)
      }
    }
    if (posthog) apply()
    const unsubscribe = subscribeAnalyticsConsent(apply)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [posthog])

  useEffect(() => {
    if (!posthog) return
    posthog.capture('$pageview')
  }, [posthog, location.pathname, location.search, location.hash])

  return children
}
