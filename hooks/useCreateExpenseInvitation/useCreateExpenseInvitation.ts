'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export interface ActiveExpenseInvitation {
  id: number
  createdAt: string
  expiresAt: string
}

interface CreatedExpenseInvitation {
  invitation: ActiveExpenseInvitation
  shareUrl: string
}

export function useCreateExpenseInvitation(expenseId: string) {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createInvitation = useCallback(async (): Promise<CreatedExpenseInvitation | null> => {
    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch(`/api/expenses/${expenseId}/invitations`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('Could not create a share link. Please try again.')
      }

      const created = await response.json() as ActiveExpenseInvitation & { token: string }
      const shareUrl = `${window.location.origin}/join/${created.token}`

      let copiedToClipboard = false
      try {
        await navigator.clipboard.writeText(shareUrl)
        copiedToClipboard = true
      } catch {
        setError('The link was created, but could not be copied. Select it and copy it manually.')
      }
      toast.success(
        copiedToClipboard ? 'Share link created and copied to clipboard' : 'Share link created',
        { id: 'expense-invitation-action' },
      )

      return {
        invitation: {
          id: created.id,
          createdAt: created.createdAt,
          expiresAt: created.expiresAt,
        },
        shareUrl,
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create a share link.')
      return null
    } finally {
      setIsCreating(false)
    }
  }, [expenseId])

  return { createInvitation, isCreating, error }
}
