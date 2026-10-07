'use client'

import { memo } from 'react'
import { useExpenseQuery } from '@/hooks/useExpensesQuery/useExpensesQuery'

export interface IExpenseProps {
  id: string
}

function Expense({ id }: IExpenseProps) {
  const expense = useExpenseQuery(id)

  return <h1 className='truncate text-xl font-bold'>{expense.expense?.name ?? 'Expense'}</h1>
}

export default memo(Expense)
