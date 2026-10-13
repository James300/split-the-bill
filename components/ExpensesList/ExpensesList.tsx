import { memo } from 'react'
import ExpenseCard, { IExpenseCardProps} from '../ExpenseCard/ExpenseCard'
import ExpensesRefreshOnActive from '@/components/ExpensesRefreshOnActive/ExpensesRefreshOnActive'

export interface IExpensesListProps {
  expenses: IExpenseCardProps[]
}

function ExpensesList ({
  expenses,
}: IExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <>
        <ExpensesRefreshOnActive />
        <div className='rounded-xl border border-dashed p-6 text-center' role='status'>
          <p className='font-medium'>No expenses yet</p>
          <p className='mt-1 text-sm text-muted-foreground'>Create an expense to start tracking shared costs.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <ExpensesRefreshOnActive />
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} {...expense} />
      ))}
    </>
  )
}

export default memo(ExpensesList)
