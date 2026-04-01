import { memo } from 'react'
import Link from 'next/link'
import Card from '@/components/Card/Card'

export interface IExpenseCardProps {
  id: number
  name: string
}

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
