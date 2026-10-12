'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface ExpenseReadStateResponse {
  lastReadAt: number
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return typeof body.error === 'string' ? body.error : fallback
  } catch {
    return fallback
  }
}

export function useExpenseReadState(expenseId: string) {
  const [lastReadAt, setLastReadAt] = useState<number | null>(null)
  const [loadedExpenseId, setLoadedExpenseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarking, setIsMarking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const pendingPaymentId = useRef<number | null>(null)
  const marking = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function loadReadState() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/expenses/${expenseId}/read-state`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(await getErrorMessage(response, 'Could not load payment read status.'))
        }
        const state = await response.json() as ExpenseReadStateResponse
        if (!cancelled) {
          setLastReadAt(state.lastReadAt)
          setLoadedExpenseId(expenseId)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load payment read status.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadReadState()
    return () => {
      cancelled = true
    }
  }, [expenseId, retryKey])

  const markRead = useCallback(async (paymentId: number): Promise<boolean> => {
    if (marking.current) return false

    marking.current = true
    pendingPaymentId.current = paymentId
    setIsMarking(true)
    setError(null)
    try {
      const response = await fetch(`/api/expenses/${expenseId}/read-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      })
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Could not update payment read status.'))
      }
      const state = await response.json() as ExpenseReadStateResponse
      setLastReadAt(state.lastReadAt)
      setLoadedExpenseId(expenseId)
      pendingPaymentId.current = null
      return true
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Could not update payment read status.')
      return false
    } finally {
      marking.current = false
      setIsMarking(false)
    }
  }, [expenseId])

  const retry = useCallback(() => {
    if (pendingPaymentId.current !== null) {
      void markRead(pendingPaymentId.current)
    } else {
      setRetryKey((current) => current + 1)
    }
  }, [markRead])

  const stateIsCurrent = loadedExpenseId === expenseId
  return {
    lastReadAt: stateIsCurrent ? lastReadAt : null,
    isLoading: !stateIsCurrent || isLoading,
    isMarking,
    error,
    markRead,
    retry,
  }
}
