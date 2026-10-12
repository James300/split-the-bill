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
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
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
      toast.success('Settlement recorded', { id: 'expense-settlement-action' })
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not record the settlement.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return { createSettlement, isSaving, error }
}
