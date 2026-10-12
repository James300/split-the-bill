'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function useCreateExpenseSettlement() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createSettlement(input: {
    expenseId: number
    payerUserId: string
    payeeUserId: string
    amount: number
  }) {
    return saveSettlement('/api/settlements', 'POST', input, 'Settlement recorded')
  }

  async function updateSettlement(settlementId: number, input: {
    payerUserId: string
    payeeUserId: string
    amount: number
  }) {
    return saveSettlement(`/api/settlements/${settlementId}`, 'PATCH', {
      payer_user_id: input.payerUserId,
      payee_user_id: input.payeeUserId,
      amount: input.amount,
    }, 'Settlement updated')
  }

  async function saveSettlement(
    url: string,
    method: 'POST' | 'PATCH',
    input: object,
    successMessage: string,
  ) {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        let message = 'Could not record the settlement.'
        try {
          const body = await response.json()
          if (typeof body.error === 'string') message = body.error
        } catch {
          message = 'Could not record the settlement.'
        }
        throw new Error(message)
      }
      toast.success(successMessage, { id: 'expense-settlement-action' })
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not record the settlement.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return { createSettlement, updateSettlement, isSaving, error }
}
