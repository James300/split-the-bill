'use client'

import { useCallback } from 'react'
import { atom, useAtom, useAtomValue } from 'jotai'
import { selectAtom  } from 'jotai/utils'
import { atomFamily } from 'jotai-family'
import type { IExpense } from '@/types/expense.interface'
import { getMaxUpdatedAt } from '@/lib/utils/getMaxUpdatedAt.function'

type ExpensesMap = Record<string, IExpense>

interface ExpensesStore {
  expenses: ExpensesMap
  isLoading: boolean,
  isError: boolean,
  lastFetchedAt: number
}

const initialExpensesState = {
  expenses: {},
  isLoading: false,
  isError: false,
  lastFetchedAt: 0,
}

const expensesStoreAtom = atom<ExpensesStore>(initialExpensesState)

const expensesAtom = selectAtom(expensesStoreAtom, (state) => state.expenses)

const lastFetchedAtAtom = selectAtom(expensesStoreAtom, (state) => state.lastFetchedAt)

const expenseFamily = atomFamily((id: string) => {
  return atom((get) => get(expensesAtom)[id])
})

export const useExpenseStore = () => {
  const [store, setStore] = useAtom(expensesStoreAtom)

  const setLastFetchedAt = useCallback((newLastFetchedAt: number) => {
    return setStore((prev) => ({
      ...prev,
      lastFetchedAt: newLastFetchedAt
    }))
  }, [])

  const setExpenses = useCallback((expenses: ExpensesMap) => {
    const expensesArray = Object.values(expenses)
    return setStore((prev) => ({
      ...prev,
      expenses,
      isLoading: false,
      isError: false,
      lastFetchedAt: getMaxUpdatedAt(expensesArray),
    }))
  }, [])

  return { store, setLastFetchedAt, setExpenses }
}

export const useExpenses = () => {
  const expenses = useAtomValue(expensesAtom)

  const { setExpenses } = useExpenseStore()

  return { expenses, setExpenses }
}

export const useExpense = (id: string) => {
  return useAtomValue(expenseFamily(id))
}
