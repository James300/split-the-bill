'use client'

import { useCallback } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import type { IPayment, IPaymentAllocation } from '@/types/payment.interface'
import { 
  createBaseStore, 
  createDataAtom, 
  createLoadingAtom, 
  createErrorAtom, 
  createLastFetchedAtAtom, 
  createEntityFamily,
  getMaxUpdatedAt 
} from '../baseStore'

const paymentStoreAtom = createBaseStore<IPayment>('split-the-bill-payments')
const paymentAllocationStoreAtom = createBaseStore<IPaymentAllocation>('split-the-bill-payment-allocations')

const paymentsAtom = createDataAtom(paymentStoreAtom)
const paymentLoadingAtom = createLoadingAtom(paymentStoreAtom)
const paymentErrorAtom = createErrorAtom(paymentStoreAtom)
const paymentLastFetchedAtAtom = createLastFetchedAtAtom(paymentStoreAtom)

const paymentAllocationsAtom = createDataAtom(paymentAllocationStoreAtom)
const paymentAllocationLoadingAtom = createLoadingAtom(paymentAllocationStoreAtom)
const paymentAllocationErrorAtom = createErrorAtom(paymentAllocationStoreAtom)
const paymentAllocationLastFetchedAtAtom = createLastFetchedAtAtom(paymentAllocationStoreAtom)

const paymentFamily = createEntityFamily(paymentsAtom)
const paymentAllocationFamily = createEntityFamily(paymentAllocationsAtom)

export const usePaymentStore = () => {
  const [store, setStore] = useAtom(paymentStoreAtom)

  const setLoading = useCallback((isLoading: boolean) => {
    setStore((prev) => ({ ...prev, isLoading }))
  }, [setStore])

  const setError = useCallback((isError: boolean) => {
    setStore((prev) => ({ ...prev, isError }))
  }, [setStore])

  const setLastFetchedAt = useCallback((lastFetchedAt: number) => {
    setStore((prev) => ({ ...prev, lastFetchedAt }))
  }, [setStore])

  const setPayments = useCallback((payments: Record<string, IPayment>) => {
    const paymentsArray = Object.values(payments)
    setStore((prev) => ({
      ...prev,
      data: payments,
      isLoading: false,
      isError: false,
      lastFetchedAt: getMaxUpdatedAt(paymentsArray),
    }))
  }, [setStore])

  const addPayment = useCallback((payment: IPayment) => {
    setStore((prev) => ({
      ...prev,
      data: { ...prev.data, [payment.id]: payment },
      isLoading: false,
      isError: false,
      lastFetchedAt: Math.max(prev.lastFetchedAt, payment.updatedAt),
    }))
  }, [setStore])

  const updatePayment = useCallback((id: string, updates: Partial<IPayment>) => {
    setStore((prev) => {
      const existingPayment = prev.data[id]
      if (!existingPayment) return prev
      
      const updatedPayment = { ...existingPayment, ...updates, updatedAt: Date.now() }
      return {
        ...prev,
        data: { ...prev.data, [id]: updatedPayment },
        lastFetchedAt: Math.max(prev.lastFetchedAt, updatedPayment.updatedAt),
      }
    })
  }, [setStore])

  const removePayment = useCallback((id: string) => {
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
    setPayments,
    addPayment,
    updatePayment,
    removePayment,
  }
}

export const usePaymentAllocationStore = () => {
  const [store, setStore] = useAtom(paymentAllocationStoreAtom)

  const setLoading = useCallback((isLoading: boolean) => {
    setStore((prev) => ({ ...prev, isLoading }))
  }, [setStore])

  const setError = useCallback((isError: boolean) => {
    setStore((prev) => ({ ...prev, isError }))
  }, [setStore])

  const setLastFetchedAt = useCallback((lastFetchedAt: number) => {
    setStore((prev) => ({ ...prev, lastFetchedAt }))
  }, [setStore])

  const setPaymentAllocations = useCallback((allocations: Record<string, IPaymentAllocation>) => {
    const allocationsArray = Object.values(allocations)
    setStore((prev) => ({
      ...prev,
      data: allocations,
      isLoading: false,
      isError: false,
      lastFetchedAt: getMaxUpdatedAt(allocationsArray),
    }))
  }, [setStore])

  const addPaymentAllocation = useCallback((allocation: IPaymentAllocation) => {
    setStore((prev) => ({
      ...prev,
      data: { ...prev.data, [allocation.id]: allocation },
      isLoading: false,
      isError: false,
      lastFetchedAt: Math.max(prev.lastFetchedAt, allocation.updatedAt),
    }))
  }, [setStore])

  const updatePaymentAllocation = useCallback((id: string, updates: Partial<IPaymentAllocation>) => {
    setStore((prev) => {
      const existingAllocation = prev.data[id]
      if (!existingAllocation) return prev
      
      const updatedAllocation = { ...existingAllocation, ...updates, updatedAt: Date.now() }
      return {
        ...prev,
        data: { ...prev.data, [id]: updatedAllocation },
        lastFetchedAt: Math.max(prev.lastFetchedAt, updatedAllocation.updatedAt),
      }
    })
  }, [setStore])

  const removePaymentAllocation = useCallback((id: string) => {
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
    setPaymentAllocations,
    addPaymentAllocation,
    updatePaymentAllocation,
    removePaymentAllocation,
  }
}

export const usePayments = () => {
  const payments = useAtomValue(paymentsAtom)
  const isLoading = useAtomValue(paymentLoadingAtom)
  const isError = useAtomValue(paymentErrorAtom)
  const lastFetchedAt = useAtomValue(paymentLastFetchedAtAtom)

  const { setPayments } = usePaymentStore()

  return { 
    payments, 
    isLoading, 
    isError, 
    lastFetchedAt,
    setPayments 
  }
}

export const usePayment = (id: string) => {
  return useAtomValue(paymentFamily(id))
}

export const usePaymentAllocations = () => {
  const paymentAllocations = useAtomValue(paymentAllocationsAtom)
  const isLoading = useAtomValue(paymentAllocationLoadingAtom)
  const isError = useAtomValue(paymentAllocationErrorAtom)
  const lastFetchedAt = useAtomValue(paymentAllocationLastFetchedAtAtom)

  const { setPaymentAllocations } = usePaymentAllocationStore()

  return { 
    paymentAllocations, 
    isLoading, 
    isError, 
    lastFetchedAt,
    setPaymentAllocations 
  }
}

export const usePaymentAllocation = (id: string) => {
  return useAtomValue(paymentAllocationFamily(id))
}
