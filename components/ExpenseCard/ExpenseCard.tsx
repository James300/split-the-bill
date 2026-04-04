import { memo } from 'react'
import Link from 'next/link'
import Card from '@/components/Card/Card'
import { IExpense } from '@/types/expense.interface'

export interface IExpenseCardProps extends IExpense {}

function ExpenseCard ({
  id,
  name,
}: IExpenseCardProps) {
  return (
    <Link href={`/expenses/${id}`}>
      <Card title={name}>
        View expense
      </Card>
    </Link>
  )
}

export default memo(ExpenseCard)
