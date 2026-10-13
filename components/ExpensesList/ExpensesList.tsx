import { memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ExpenseCard, { IExpenseCardProps} from '../ExpenseCard/ExpenseCard'
import { useRefreshWhenActive } from '@/hooks/useRefreshWhenActive/useRefreshWhenActive'

export interface IExpensesListProps {
  expenses: IExpenseCardProps[]
}

function ExpensesList ({
  expenses,
}: IExpensesListProps) {
  const router = useRouter()
  const refreshExpenses = useCallback(() => router.refresh(), [router])
  useRefreshWhenActive(refreshExpenses)

  if (expenses.length === 0) {
    return (
      <div className='rounded-xl border border-dashed p-6 text-center' role='status'>
        <p className='font-medium'>No expenses yet</p>
        <p className='mt-1 text-sm text-muted-foreground'>Create an expense to start tracking shared costs.</p>
      </div>
    )
  }

  return expenses.map((expense) => (
    <ExpenseCard key={expense.id} {...expense} />
  ))
}

export default memo(ExpensesList)
