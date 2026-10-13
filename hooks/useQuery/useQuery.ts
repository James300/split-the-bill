'use client'

import { useCallback } from 'react'

export function useQuery<T>({
  endpoint,
  isLoading,
  lastFetchedAt,
  setLoading,
  setError,
  setData,
}: {
  endpoint: string
  isLoading: boolean
  lastFetchedAt: number
  setLoading: (loading: boolean) => void
  setError: (error: boolean) => void
  setData: (data: T) => void
}) {
  const fetchData = useCallback(async (force = false) => {
    if (isLoading || (!force && lastFetchedAt !== 0)) {
      return
    }

    setLoading(true)
    setError(false)
    try {
      const response = await fetch(endpoint, { cache: 'no-store' })
      if (!response.ok) {
        setError(true)
        return
      }

      const data = await response.json() as T
      setData(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [isLoading, lastFetchedAt, setLoading, setData, setError, endpoint])

  return fetchData
}
