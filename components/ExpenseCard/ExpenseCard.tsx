import { memo } from 'react'
import Link from 'next/link'
import Card from '@/components/Card/Card'
import { IExpense } from '@/types/expense.interface'

export type IExpenseCardProps = IExpense

function ExpenseCard ({
  id,
  name,
  archivedAt,
}: IExpenseCardProps) {
  return (
    <Link href={`/expenses/${id}`}>
      <Card title={name}>
        <span className='flex items-center justify-between gap-3 pr-8'>
          <span>View expense</span>
          {archivedAt && (
            <span className='rounded-full border border-muted-foreground/30 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'>
              Archived
            </span>
          )}
        </span>
      </Card>
    </Link>
  )
}

export default memo(ExpenseCard)
