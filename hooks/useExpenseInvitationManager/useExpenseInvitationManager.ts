'use client'

import { useCallback, useState } from 'react'
import { useCreateExpenseInvitation } from '@/hooks/useCreateExpenseInvitation/useCreateExpenseInvitation'
import type { ActiveExpenseInvitation } from '@/hooks/useCreateExpenseInvitation/useCreateExpenseInvitation'
import { useRevokeExpenseInvitation } from '@/hooks/useRevokeExpenseInvitation/useRevokeExpenseInvitation'

export function useExpenseInvitationManager(expenseId: string) {
  const [createdLink, setCreatedLink] = useState<{
    invitation: ActiveExpenseInvitation
    shareUrl: string
  } | null>(null)
  const {
    createInvitation: createExpenseInvitation,
    isCreating,
    error: createError,
  } = useCreateExpenseInvitation(expenseId)
  const {
    revokeInvitation: revokeExpenseInvitation,
    isRevoking,
    error: revokeError,
  } = useRevokeExpenseInvitation(expenseId)

  const createInvitation = useCallback(async () => {
    const created = await createExpenseInvitation()
    if (created) {
      setCreatedLink(created)
    }
  }, [createExpenseInvitation])

  const revokeInvitation = useCallback(async () => {
    if (!createdLink) return
    const wasRevoked = await revokeExpenseInvitation(createdLink.invitation.id)
    if (wasRevoked) {
      setCreatedLink(null)
    }
  }, [createdLink, revokeExpenseInvitation])

  return {
    invitation: createdLink?.invitation ?? null,
    shareUrl: createdLink?.shareUrl ?? '',
    isSaving: isCreating || isRevoking,
    error: createError ?? revokeError,
    createInvitation,
    revokeInvitation,
  }
}
