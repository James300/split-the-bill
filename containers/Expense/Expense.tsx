'use client'

import { memo } from 'react'
import Heading from '@/components/Heading/Heading'
import { useExpense } from '@/store/ExpensesStore/ExpensesStore'

export interface IExpenseProps {
  id: string
}

function Expense({ id }: IExpenseProps) {
  const expense = useExpense(id)

  console.log(id, expense)

  return (
    <div>
      <Heading tag='h5'>Expense</Heading>
    </div>
  )
}

export default memo(Expense)
