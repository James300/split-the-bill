import { memo } from 'react'
import ExpenseCard, { IExpenseCardProps} from '../ExpenseCard/ExpenseCard'

export interface IExpensesListProps {
  expenses: IExpenseCardProps[]
}

function ExpensesList ({
  expenses,
}: IExpensesListProps) {
  if (expenses?.length === 0) {
    return null
  }

  return expenses.map((expense) => (
    <ExpenseCard key={expense.id} {...expense} />
  ))
}

export default memo(ExpensesList)
