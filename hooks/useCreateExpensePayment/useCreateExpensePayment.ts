'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { ExpensePaymentCreateInput } from '@/lib/schemas/payment.schema'

async function getErrorMessage(response: Response) {
  try {
    const body = await response.json()
    const firstDetail = Array.isArray(body.details) ? body.details[0]?.message : null
    return firstDetail ?? body.error ?? 'Could not save this payment. Please try again.'
  } catch {
    return 'Could not save this payment. Please try again.'
  }
}

export function useCreateExpensePayment() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPayment = useCallback(async (input: ExpensePaymentCreateInput) => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      toast.success('Payment added', { id: 'expense-payment-action' })
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this payment.')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  return { createPayment, isSaving, error }
}
