'use client'

import { useEffect, useRef } from 'react'

export function useOnVisible<T extends HTMLElement>(
  enabled: boolean,
  onVisible: () => void,
) {
  const elementRef = useRef<T>(null)
  const callbackRef = useRef(onVisible)

  useEffect(() => {
    callbackRef.current = onVisible
  }, [onVisible])

  useEffect(() => {
    const element = elementRef.current
    if (!enabled || !element || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect()
        callbackRef.current()
      }
    }, { threshold: 0.5 })

    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled])

  return elementRef
}
