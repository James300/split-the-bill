'use client'

import { useCallback } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import type { ISettlement } from '@/types/settlement.interface'
import { 
  createBaseStore, 
  createDataAtom, 
  createLoadingAtom, 
  createErrorAtom, 
  createLastFetchedAtAtom, 
  createEntityFamily,
  getMaxUpdatedAt 
} from '../baseStore'

const settlementStoreAtom = createBaseStore<ISettlement>('split-the-bill-settlements')

const settlementsAtom = createDataAtom(settlementStoreAtom)
const loadingAtom = createLoadingAtom(settlementStoreAtom)
const errorAtom = createErrorAtom(settlementStoreAtom)
const lastFetchedAtAtom = createLastFetchedAtAtom(settlementStoreAtom)

const settlementFamily = createEntityFamily(settlementsAtom)

export const useSettlementStore = () => {
  const [store, setStore] = useAtom(settlementStoreAtom)

  const setLoading = useCallback((isLoading: boolean) => {
    setStore((prev) => ({ ...prev, isLoading }))
  }, [setStore])

  const setError = useCallback((isError: boolean) => {
    setStore((prev) => ({ ...prev, isError }))
  }, [setStore])

  const setLastFetchedAt = useCallback((lastFetchedAt: number) => {
    setStore((prev) => ({ ...prev, lastFetchedAt }))
  }, [setStore])

  const setSettlements = useCallback((settlements: Record<string, ISettlement>) => {
    const settlementsArray = Object.values(settlements)
    setStore((prev) => ({
      ...prev,
      data: settlements,
      isLoading: false,
      isError: false,
      lastFetchedAt: getMaxUpdatedAt(settlementsArray),
    }))
  }, [setStore])

  const addSettlement = useCallback((settlement: ISettlement) => {
    setStore((prev) => ({
      ...prev,
      data: { ...prev.data, [settlement.id]: settlement },
      isLoading: false,
      isError: false,
      lastFetchedAt: Math.max(prev.lastFetchedAt, settlement.updatedAt),
    }))
  }, [setStore])

  const updateSettlement = useCallback((id: string, updates: Partial<ISettlement>) => {
    setStore((prev) => {
      const existingSettlement = prev.data[id]
      if (!existingSettlement) return prev
      
      const updatedSettlement = { ...existingSettlement, ...updates, updatedAt: Date.now() }
      return {
        ...prev,
        data: { ...prev.data, [id]: updatedSettlement },
        lastFetchedAt: Math.max(prev.lastFetchedAt, updatedSettlement.updatedAt),
      }
    })
  }, [setStore])

  const removeSettlement = useCallback((id: string) => {
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
    setSettlements,
    addSettlement,
    updateSettlement,
    removeSettlement,
  }
}

export const useSettlements = () => {
  const settlements = useAtomValue(settlementsAtom)
  const isLoading = useAtomValue(loadingAtom)
  const isError = useAtomValue(errorAtom)
  const lastFetchedAt = useAtomValue(lastFetchedAtAtom)

  const { setSettlements } = useSettlementStore()

  return { 
    settlements, 
    isLoading, 
    isError, 
    lastFetchedAt,
    setSettlements 
  }
}

export const useSettlement = (id: string) => {
  return useAtomValue(settlementFamily(id))
}
