'use client'

import { useCallback, useEffect, useState } from 'react'

export interface ExpenseSettlementRecord {
  id: number
  expenseId: number
  payerUserId: string
  payeeUserId: string
  amount: number
  date: string
  createdAt: number
  updatedAt: number
  createdByUserId: string | null
  deletedAt?: number
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return typeof body.error === 'string' ? body.error : fallback
  } catch {
    return fallback
  }
}

export function useExpenseSettlements(expenseId: string, refreshKey: number) {
  const [settlements, setSettlements] = useState<ExpenseSettlementRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadSettlements() {
      setIsLoading(true)
      setError(null)
      try {
        const query = new URLSearchParams({ expense_id: expenseId })
        const response = await fetch(`/api/settlements?${query.toString()}`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(await getErrorMessage(response, 'Could not load settlement history.'))
        }
        const settlementMap = await response.json() as Record<string, ExpenseSettlementRecord>
        if (!cancelled) {
          setSettlements(Object.values(settlementMap).sort((left, right) =>
            right.createdAt - left.createdAt || right.id - left.id,
          ))
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load settlement history.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadSettlements()
    return () => {
      cancelled = true
    }
  }, [expenseId, refreshKey, retryKey])

  const retry = useCallback(() => setRetryKey((current) => current + 1), [])
  return { settlements, isLoading, error, retry }
}
