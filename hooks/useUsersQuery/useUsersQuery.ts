'use client'

import { useEffect } from 'react'
import { useUser, useUsers } from '@/store/UserStore/UserStore'
import { useUserStore } from '@/store/UserStore/UserStore'
import { useQuery } from '../useQuery/useQuery'

function useUserQueryHelper() {
  const { isLoading, isError, lastFetchedAt, setUsers } = useUsers()
  const { setLoading, setError } = useUserStore()
  
  const fetchUsers = useQuery({
    isLoading,
    lastFetchedAt,
    setLoading,
    setError,
    setData: setUsers,
    endpoint: '/api/users'
  })
  
  return { fetchUsers, isLoading, isError }
}

export function useUsersQuery() {
  const { fetchUsers, isLoading, isError } = useUserQueryHelper()
  const { users } = useUsers()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
  
  return { users, isLoading, isError }
}

export function useUserQuery(id: string) {
  const { fetchUsers, isLoading, isError } = useUserQueryHelper()
  const user = useUser(id)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
  
  return { user, isLoading, isError }
}
