'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface ExpenseBalance {
  userId: string
  amountNet: number
}

interface ExpenseBalancesResponse {
  balances: ExpenseBalance[]
}

function isExpenseBalancesResponse(value: unknown): value is ExpenseBalancesResponse {
  return typeof value === 'object'
    && value !== null
    && 'balances' in value
    && Array.isArray(value.balances)
    && value.balances.every((balance: unknown) =>
      typeof balance === 'object'
      && balance !== null
      && 'userId' in balance
      && typeof balance.userId === 'string'
      && 'amountNet' in balance
      && Number.isSafeInteger(balance.amountNet),
    )
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return typeof body.error === 'string' ? body.error : fallback
  } catch {
    return fallback
  }
}

export function useExpenseBalances(
  expenseId: string,
  enabled: boolean,
  refreshKey = 0,
  pageRefreshKey = 0,
) {
  const [balances, setBalances] = useState<ExpenseBalance[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const lastFetchKey = useRef<string | null>(null)

  useEffect(() => {
    const fetchKey = `${expenseId}:${refreshKey}:${pageRefreshKey}:${retryKey}`
    if (!enabled || lastFetchKey.current === fetchKey) return

    lastFetchKey.current = fetchKey

    let cancelled = false
    let finished = false

    async function loadBalances() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/expenses/${expenseId}/owed`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(await getErrorMessage(response, 'Could not load expense balances.'))
        }

        const data: unknown = await response.json()
        if (!isExpenseBalancesResponse(data)) {
          throw new Error('The expense balance response was invalid.')
        }
        if (!cancelled) setBalances(data.balances)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load expense balances.')
        }
      } finally {
        if (!cancelled) {
          finished = true
          setIsLoading(false)
        }
      }
    }

    void loadBalances()
    return () => {
      cancelled = true
      if (!finished && lastFetchKey.current === fetchKey) lastFetchKey.current = null
    }
  }, [enabled, expenseId, pageRefreshKey, refreshKey, retryKey])

  const retry = useCallback(() => setRetryKey((current) => current + 1), [])

  return { balances, isLoading, error, retry }
}
