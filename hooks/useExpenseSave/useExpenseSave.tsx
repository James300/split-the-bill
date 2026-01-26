import { useCallback, useState } from 'react'
import { ICreateExpense } from '@/types/expense.interface'

function useExpenseSave() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const saveExpense = useCallback(async (expense: ICreateExpense) => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      })

      console.log(response)
    } catch (err) {
      console.log(err)
      setError(err as any)
    } finally {
      setIsSaving(false)
    }
  }, [])

  return {
    isSaving,
    error,
    saveExpense,
  }
}

export default useExpenseSave
