'use client'

import { useCallback, useEffect, useState } from 'react'

interface ExpensePaymentRecord {
  id: number
  expenseId: number
  paidByUserId: string
  amount: number
  description?: string
  createdAt: number
  updatedAt: number
}

interface PaymentAllocationRecord {
  payment_id: number
  user_id: string
  amount: number
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return typeof body.error === 'string' ? body.error : fallback
  } catch {
    return fallback
  }
}

export function useExpensePayments(expenseId: string, refreshKey: number) {
  const [payments, setPayments] = useState<ExpensePaymentRecord[]>([])
  const [allocations, setAllocations] = useState<PaymentAllocationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadPayments() {
      setIsLoading(true)
      setError(null)
      try {
        const query = new URLSearchParams({ expense_id: expenseId })
        const [paymentsResponse, allocationsResponse] = await Promise.all([
          fetch(`/api/payments?${query.toString()}`, { cache: 'no-store' }),
          fetch(`/api/payment-allocations?${query.toString()}`, { cache: 'no-store' }),
        ])

        if (!paymentsResponse.ok) {
          throw new Error(await getErrorMessage(paymentsResponse, 'Could not load expense payments.'))
        }
        if (!allocationsResponse.ok) {
          throw new Error(await getErrorMessage(allocationsResponse, 'Could not load payment shares.'))
        }

        const [paymentMap, allocationRows] = await Promise.all([
          paymentsResponse.json() as Promise<Record<string, ExpensePaymentRecord>>,
          allocationsResponse.json() as Promise<PaymentAllocationRecord[]>,
        ])
        if (cancelled) return

        setPayments(Object.values(paymentMap).sort((a, b) =>
          b.createdAt - a.createdAt || b.id - a.id,
        ))
        setAllocations(allocationRows)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load expense payments.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadPayments()
    return () => {
      cancelled = true
    }
  }, [expenseId, refreshKey, retryKey])

  const retry = useCallback(() => setRetryKey((current) => current + 1), [])

  return { payments, allocations, isLoading, error, retry }
}
