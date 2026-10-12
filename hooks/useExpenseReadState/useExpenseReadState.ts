'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface ExpenseReadStateResponse {
  lastReadAt: number
  lastReadActivity: ExpenseActivityPosition | null
}

export interface ExpenseActivityPosition {
  activityType: 'payment' | 'settlement'
  activityId: number
  activityDate: string
}

export interface ExpenseActivityCursor {
  activityType: ExpenseActivityPosition['activityType']
  activityId: number
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
  const [lastReadActivity, setLastReadActivity] = useState<ExpenseActivityPosition | null>(null)
  const [loadedExpenseId, setLoadedExpenseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarking, setIsMarking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMarkedReadThisVisit, setHasMarkedReadThisVisit] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const pendingActivity = useRef<ExpenseActivityCursor | null>(null)
  const marking = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function loadReadState() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/expenses/${expenseId}/read-state`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(await getErrorMessage(response, 'Could not load activity read status.'))
        }
        const state = await response.json() as ExpenseReadStateResponse
        if (!cancelled) {
          setLastReadAt(state.lastReadAt)
          setLastReadActivity(state.lastReadActivity)
          setLoadedExpenseId(expenseId)
          setHasMarkedReadThisVisit(false)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load activity read status.')
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

  const markRead = useCallback(async (activity: ExpenseActivityCursor): Promise<boolean> => {
    if (marking.current) return false

    marking.current = true
    pendingActivity.current = activity
    setIsMarking(true)
    setError(null)
    try {
      const response = await fetch(`/api/expenses/${expenseId}/read-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      })
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Could not update activity read status.'))
      }
      await response.json() as ExpenseReadStateResponse
      pendingActivity.current = null
      setHasMarkedReadThisVisit(true)
      return true
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Could not update activity read status.')
      return false
    } finally {
      marking.current = false
      setIsMarking(false)
    }
  }, [expenseId])

  const retry = useCallback(() => {
    if (pendingActivity.current !== null) {
      void markRead(pendingActivity.current)
    } else {
      setRetryKey((current) => current + 1)
    }
  }, [markRead])

  const stateIsCurrent = loadedExpenseId === expenseId
  return {
    lastReadAt: stateIsCurrent ? lastReadAt : null,
    lastReadActivity: stateIsCurrent ? lastReadActivity : null,
    isLoading: !stateIsCurrent || isLoading,
    isMarking,
    hasMarkedReadThisVisit,
    error,
    markRead,
    retry,
  }
}
