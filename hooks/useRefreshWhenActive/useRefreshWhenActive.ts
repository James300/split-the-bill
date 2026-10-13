'use client'

import { useEffect, useRef } from 'react'

const INACTIVE_REFRESH_THRESHOLD_MS = 5 * 60 * 1000

export function useRefreshWhenActive(onRefresh: () => void) {
  const callbackRef = useRef(onRefresh)

  useEffect(() => {
    callbackRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    let inactiveSince = document.visibilityState === 'hidden' ? Date.now() : null

    const markInactive = () => {
      if (inactiveSince === null) inactiveSince = Date.now()
    }

    const refreshIfInactive = () => {
      if (document.visibilityState === 'hidden' || inactiveSince === null) return

      const inactiveDuration = Date.now() - inactiveSince
      inactiveSince = null
      if (inactiveDuration >= INACTIVE_REFRESH_THRESHOLD_MS) {
        callbackRef.current()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markInactive()
      } else {
        refreshIfInactive()
      }
    }

    window.addEventListener('blur', markInactive)
    window.addEventListener('focus', refreshIfInactive)
    window.addEventListener('pagehide', markInactive)
    window.addEventListener('pageshow', refreshIfInactive)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('blur', markInactive)
      window.removeEventListener('focus', refreshIfInactive)
      window.removeEventListener('pagehide', markInactive)
      window.removeEventListener('pageshow', refreshIfInactive)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
