'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
  currency: string
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return typeof body.error === 'string' ? body.error : fallback
  } catch {
    return fallback
  }
}

export function useExpenseMembers(expenseId: string, enabled: boolean, pageRefreshKey = 0) {
  const [members, setMembers] = useState<ExpenseMember[]>([])
  const [canManageMembers, setCanManageMembers] = useState(false)
  const [currency, setCurrency] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastFetchKey = useRef<string | null>(null)
  const requestSequence = useRef(0)

  const loadMembers = useCallback(async () => {
    if (!enabled) return
    const requestId = ++requestSequence.current
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/expenses/${expenseId}/users`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Could not load expense members.'))
      }
      const data = await response.json() as ExpenseMembersResponse
      if (requestId !== requestSequence.current) return
      setMembers(data.members)
      setCanManageMembers(data.canManageMembers)
      setCurrency(data.currency)
    } catch (loadError) {
      if (requestId === requestSequence.current) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load expense members.')
      }
    } finally {
      if (requestId === requestSequence.current) setIsLoading(false)
    }
  }, [enabled, expenseId])

  useEffect(() => {
    const fetchKey = `${expenseId}:${pageRefreshKey}`
    if (!enabled || lastFetchKey.current === fetchKey) return

    lastFetchKey.current = fetchKey
    void loadMembers()
  }, [enabled, expenseId, loadMembers, pageRefreshKey])

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

  return { members, canManageMembers, currency, isLoading, removingUserId, error, removeMember, reload: loadMembers }
}
