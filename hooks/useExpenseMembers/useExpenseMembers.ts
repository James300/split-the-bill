'use client'

import { useCallback, useEffect, useState } from 'react'

export interface ExpenseMember {
  id: string
  name: string
  isCreator: boolean
  isCurrentUser: boolean
  canBeRemoved: boolean
}

interface ExpenseMembersResponse {
  members: ExpenseMember[]
  canManageMembers: boolean
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return typeof body.error === 'string' ? body.error : fallback
  } catch {
    return fallback
  }
}

export function useExpenseMembers(expenseId: string, enabled: boolean) {
  const [members, setMembers] = useState<ExpenseMember[]>([])
  const [canManageMembers, setCanManageMembers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/expenses/${expenseId}/users`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Could not load expense members.'))
      }
      const data = await response.json() as ExpenseMembersResponse
      setMembers(data.members)
      setCanManageMembers(data.canManageMembers)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load expense members.')
    } finally {
      setIsLoading(false)
    }
  }, [enabled, expenseId])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  const removeMember = useCallback(async (userId: string) => {
    setRemovingUserId(userId)
    setError(null)
    try {
      const response = await fetch(`/api/expenses/${expenseId}/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Could not remove this member.'))
      }
      await loadMembers()
      return true
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove this member.')
      return false
    } finally {
      setRemovingUserId(null)
    }
  }, [expenseId, loadMembers])

  return { members, canManageMembers, isLoading, removingUserId, error, removeMember, reload: loadMembers }
}
