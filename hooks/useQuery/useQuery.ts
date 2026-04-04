'use client'

import { useCallback } from 'react'

export function useQuery({
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
  setData: (data: any) => void
}) {
  const fetchData = useCallback(async () => {
    if (isLoading || lastFetchedAt !== 0) {
      return
    }

    setLoading(true)
    const response = await fetch(endpoint)
    if (!response.ok) {
      setError(true)
      return
    }

    const data = await response.json()
    setLoading(false)
    setData(data)
  }, [isLoading, lastFetchedAt, setLoading, setData, setError, endpoint])

  return fetchData
}
