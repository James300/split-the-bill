'use client'

import { useCallback } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import type { IUser } from '@/types/user.interface'
import { 
  createBaseStore, 
  createDataAtom, 
  createLoadingAtom, 
  createErrorAtom, 
  createLastFetchedAtAtom, 
  createEntityFamily,
  getMaxUpdatedAt 
} from '../baseStore'

const userStoreAtom = createBaseStore<IUser>('split-the-bill-users')

const usersAtom = createDataAtom(userStoreAtom)
const loadingAtom = createLoadingAtom(userStoreAtom)
const errorAtom = createErrorAtom(userStoreAtom)
const lastFetchedAtAtom = createLastFetchedAtAtom(userStoreAtom)

const userFamily = createEntityFamily(usersAtom)

export const useUserStore = () => {
  const [store, setStore] = useAtom(userStoreAtom)

  const setLoading = useCallback((isLoading: boolean) => {
    setStore((prev) => ({ ...prev, isLoading }))
  }, [setStore])

  const setError = useCallback((isError: boolean) => {
    setStore((prev) => ({ ...prev, isError }))
  }, [setStore])

  const setLastFetchedAt = useCallback((lastFetchedAt: number) => {
    setStore((prev) => ({ ...prev, lastFetchedAt }))
  }, [setStore])

  const setUsers = useCallback((users: Record<string, IUser>) => {
    const usersArray = Object.values(users)
    setStore((prev) => ({
      ...prev,
      data: users,
      isLoading: false,
      isError: false,
      lastFetchedAt: getMaxUpdatedAt(usersArray),
    }))
  }, [setStore])

  const addUser = useCallback((user: IUser) => {
    setStore((prev) => ({
      ...prev,
      data: { ...prev.data, [user.id]: user },
      isLoading: false,
      isError: false,
      lastFetchedAt: Math.max(prev.lastFetchedAt, user.updatedAt),
    }))
  }, [setStore])

  const updateUser = useCallback((id: string, updates: Partial<IUser>) => {
    setStore((prev) => {
      const existingUser = prev.data[id]
      if (!existingUser) return prev
      
      const updatedUser = { ...existingUser, ...updates, updatedAt: Date.now() }
      return {
        ...prev,
        data: { ...prev.data, [id]: updatedUser },
        lastFetchedAt: Math.max(prev.lastFetchedAt, updatedUser.updatedAt),
      }
    })
  }, [setStore])

  const removeUser = useCallback((id: string) => {
    setStore((prev) => {
      const { [id]: removed, ...rest } = prev.data
      return { ...prev, data: rest }
    })
  }, [setStore])

  return {
    store,
    setLoading,
    setError,
    setLastFetchedAt,
    setUsers,
    addUser,
    updateUser,
    removeUser,
  }
}

export const useUsers = () => {
  const users = useAtomValue(usersAtom)
  const isLoading = useAtomValue(loadingAtom)
  const isError = useAtomValue(errorAtom)
  const lastFetchedAt = useAtomValue(lastFetchedAtAtom)

  const { setUsers } = useUserStore()

  return { 
    users, 
    isLoading, 
    isError, 
    lastFetchedAt,
    setUsers 
  }
}

export const useUser = (id: string) => {
  return useAtomValue(userFamily(id))
}
