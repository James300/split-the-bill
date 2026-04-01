import { atom, useAtom } from 'jotai'
import type { IExpense } from '@/types/expense.interface'

export const expensesAtom = atom<IExpense[]>([])

export const useExpenses = () => {
  const [expenses, setExpenses] = useAtom(expensesAtom)
  return { expenses, setExpenses }
}
