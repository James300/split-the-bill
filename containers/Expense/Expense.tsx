'use client'

import { memo } from 'react'
import { useExpenseQuery } from '@/hooks/useExpensesQuery/useExpensesQuery'

export interface IExpenseProps {
  id: string
}

function Expense({ id, pageRefreshKey }: IExpenseProps & { pageRefreshKey: number }) {
  const expense = useExpenseQuery(id, pageRefreshKey)

  return (
    <div className='flex min-w-0 items-center gap-2'>
      <h1 className='truncate text-xl font-bold'>{expense.expense?.name ?? 'Expense'}</h1>
      {expense.expense?.archivedAt && (
        <span className='shrink-0 rounded-full border border-muted-foreground/30 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'>
          Archived
        </span>
      )}
    </div>
  )
}

export default memo(Expense)
