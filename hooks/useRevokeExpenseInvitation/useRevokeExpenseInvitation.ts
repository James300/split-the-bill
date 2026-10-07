'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export function useRevokeExpenseInvitation(expenseId: string) {
  const [isRevoking, setIsRevoking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const revokeInvitation = useCallback(async (invitationId: number): Promise<boolean> => {
    setIsRevoking(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/expenses/${expenseId}/invitations/${invitationId}`,
        { method: 'DELETE' },
      )
      if (!response.ok) {
        throw new Error('Could not revoke the share link. Please try again.')
      }
      toast.success('Share link revoked', { id: 'expense-invitation-action' })
      return true
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : 'Could not revoke the share link.')
      return false
    } finally {
      setIsRevoking(false)
    }
  }, [expenseId])

  return { revokeInvitation, isRevoking, error }
}
