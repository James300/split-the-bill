import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ICreateExpense } from '@/types/expense.interface'

function useExpenseSave() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const saveExpense = useCallback(async (expense: ICreateExpense) => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      })

      if (!response.ok) {
        setError('Failed to save expense. Please try again later.')
        return
      }

      router.push('/')
    } catch {
      setError('Failed to save expense. Please try again later.')
    } finally {
      setIsSaving(false)
    }
  }, [router])

  return {
    isSaving,
    error,
    saveExpense,
  }
}

export default useExpenseSave
