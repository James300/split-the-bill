'use client'

import { useCallback } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import type { IExpense } from '@/types/expense.interface'
import { 
  createBaseStore, 
  createDataAtom, 
  createLoadingAtom, 
  createErrorAtom, 
  createLastFetchedAtAtom, 
  createEntityFamily,
  getMaxUpdatedAt 
} from '../baseStore'

const expenseStoreAtom = createBaseStore<IExpense>('split-the-bill-expenses')

const expensesAtom = createDataAtom(expenseStoreAtom)
const loadingAtom = createLoadingAtom(expenseStoreAtom)
const errorAtom = createErrorAtom(expenseStoreAtom)
const lastFetchedAtAtom = createLastFetchedAtAtom(expenseStoreAtom)

const expenseFamily = createEntityFamily(expensesAtom)

export const useExpenseStore = () => {
  const [store, setStore] = useAtom(expenseStoreAtom)

  const setLoading = useCallback((isLoading: boolean) => {
    setStore((prev) => ({ ...prev, isLoading }))
  }, [setStore])

  const setError = useCallback((isError: boolean) => {
    setStore((prev) => ({ ...prev, isError }))
  }, [setStore])

  const setLastFetchedAt = useCallback((lastFetchedAt: number) => {
    setStore((prev) => ({ ...prev, lastFetchedAt }))
  }, [setStore])

  const setExpenses = useCallback((expenses: Record<string, IExpense>) => {
    const expensesArray = Object.values(expenses)
    setStore((prev) => ({
      ...prev,
      data: expenses,
      isLoading: false,
      isError: false,
      lastFetchedAt: Math.max(prev.lastFetchedAt, getMaxUpdatedAt(expensesArray)),
    }))
  }, [setStore])

  const addExpense = useCallback((expense: IExpense) => {
    setStore((prev) => ({
      ...prev,
      data: { ...prev.data, [expense.id]: expense },
      isLoading: false,
      isError: false,
      lastFetchedAt: Math.max(prev.lastFetchedAt, expense.updatedAt),
    }))
  }, [setStore])

  const updateExpense = useCallback((id: string, updates: Partial<IExpense>) => {
    setStore((prev) => {
      const existingExpense = prev.data[id]
      if (!existingExpense) return prev

      const updatedExpense = { ...existingExpense, ...updates, updatedAt: Date.now() }
      return {
        ...prev,
        data: { ...prev.data, [id]: updatedExpense },
      }
    })
  }, [setStore])

  const removeExpense = useCallback((id: string) => {
    setStore((prev) => {
      const { [id]: removed, ...rest } = prev.data
      return { ...prev, data: rest }
    })
  }, [setStore])

  return {
    store,
    storeAtom: expenseStoreAtom,
    setLoading,
    setError,
    setLastFetchedAt,
    setExpenses: setExpenses,
    addExpense,
    updateExpense,
    removeExpense,
  }
}

export const useExpenses = () => {
  const expenses = useAtomValue(expensesAtom)
  const isLoading = useAtomValue(loadingAtom)
  const isError = useAtomValue(errorAtom)
  const lastFetchedAt = useAtomValue(lastFetchedAtAtom)

  const { setExpenses, setLoading, setError } = useExpenseStore()

  return { 
    expenses, 
    isLoading, 
    isError, 
    lastFetchedAt,
    setExpenses,
    setLoading,
    setError,
  }
}

export const useExpense = (id: string) => {
  return useAtomValue(expenseFamily(id))
}
