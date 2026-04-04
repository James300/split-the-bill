'use client'

import { useEffect } from 'react'
import { useExpense, useExpenses } from '@/store/ExpensesStore/ExpensesStore'
import { useQuery } from '../useQuery/useQuery'

function useExpenseQueryHelper() {
  const { isLoading, isError, lastFetchedAt, setExpenses, setLoading, setError } = useExpenses()
  
  const fetchExpense = useQuery({
    isLoading,
    lastFetchedAt,
    setLoading,
    setError,
    setData: setExpenses,
    endpoint: '/api/expenses'
  })
  
  return { fetchExpense, isLoading, isError }
}

export function useExpensesQuery() {
  const { fetchExpense, isLoading, isError } = useExpenseQueryHelper()
  const { expenses } = useExpenses()

  useEffect(() => {
    fetchExpense()
  }, [fetchExpense])
  
  return { expenses, isLoading, isError }
}

export function useExpenseQuery(id: string) {
  const { fetchExpense, isLoading, isError } = useExpenseQueryHelper()
  const expense = useExpense(id)

  useEffect(() => {
    fetchExpense()
  }, [fetchExpense])
  
  return { expense, isLoading, isError }
}
