import { memo } from 'react'
import Link from 'next/link'
import Card from '@/components/Card/Card'

export interface IExpenseCardProps {
  id: number
  amountTotal: number
  name: string
}

function getExpenseCardContent (amountTotal: number) {
  if (amountTotal > 0) {
    return `You are owed $${amountTotal}`
  }

  if (amountTotal < 0) {
    return `You owe $${-amountTotal}`
  }

  return 'All Paid'
}

function ExpenseCard ({
  id,
  amountTotal,
  name,
}: IExpenseCardProps) {
  return (
    <Link href={`/expenses/${id}`}>
      <Card title={name}>
        {getExpenseCardContent(amountTotal)}
      </Card>
    </Link>
  )
}

export default memo(ExpenseCard)
