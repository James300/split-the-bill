'use client'

import { memo, useState } from 'react'
import ExpenseCard, { IExpenseCardProps} from '../ExpenseCard/ExpenseCard'
import ExpensesRefreshOnActive from '@/components/ExpensesRefreshOnActive/ExpensesRefreshOnActive'
import Button from '@/components/Button'

export interface IExpensesListProps {
  expenses: IExpenseCardProps[]
}

function isExpenseCardProps(value: unknown): value is IExpenseCardProps {
  if (typeof value !== 'object' || value === null) return false
  return 'id' in value
    && typeof value.id === 'number'
    && 'name' in value
    && typeof value.name === 'string'
    && 'currency' in value
    && typeof value.currency === 'string'
    && 'createdAt' in value
    && typeof value.createdAt === 'number'
    && 'updatedAt' in value
    && typeof value.updatedAt === 'number'
    && 'userIds' in value
    && Array.isArray(value.userIds)
    && value.userIds.every((userId) => typeof userId === 'string')
    && 'archivedAt' in value
    && (value.archivedAt === null || typeof value.archivedAt === 'number')
}

function ExpensesList ({
  expenses,
}: IExpensesListProps) {
  const [showArchived, setShowArchived] = useState(false)
  const [archivedExpenses, setArchivedExpenses] = useState<IExpenseCardProps[] | null>(null)
  const [isLoadingArchived, setIsLoadingArchived] = useState(false)
  const [archivedError, setArchivedError] = useState<string | null>(null)

  const loadArchivedExpenses = async () => {
    setShowArchived(true)
    if (archivedExpenses || isLoadingArchived) return

    setIsLoadingArchived(true)
    setArchivedError(null)
    try {
      const response = await fetch('/api/expenses?includeArchived=true', { cache: 'no-store' })
      if (!response.ok) throw new Error('Could not load archived expenses.')
      const data: unknown = await response.json()
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error('The archived expenses response was invalid.')
      }
      const rows = Object.values(data)
      if (!rows.every(isExpenseCardProps)) {
        throw new Error('The archived expenses response was invalid.')
      }
      setArchivedExpenses(rows)
    } catch (error) {
      setArchivedError(error instanceof Error ? error.message : 'Could not load archived expenses.')
      setShowArchived(false)
    } finally {
      setIsLoadingArchived(false)
    }
  }

  const activeExpenses = expenses.filter((expense) => !expense.archivedAt)
  const archived = (archivedExpenses ?? []).filter((expense) => expense.archivedAt)

  if (activeExpenses.length === 0
    && (!showArchived || (archived.length === 0 && !isLoadingArchived))) {
    return (
      <>
        <ExpensesRefreshOnActive />
        <div className='flex flex-col gap-4'>
          <div className='rounded-xl border border-dashed p-6 text-center' role='status'>
            <p className='font-medium'>No expenses yet</p>
            <p className='mt-1 text-sm text-muted-foreground'>Create an expense to start tracking shared costs.</p>
          </div>
          <ArchivedExpensesControl
            showArchived={showArchived}
            isLoading={isLoadingArchived}
            error={archivedError}
            onShow={loadArchivedExpenses}
            onHide={() => setShowArchived(false)}
          />
          {showArchived && archived.map((expense) => (
            <ExpenseCard key={expense.id} {...expense} />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <ExpensesRefreshOnActive />
      <div className='flex flex-col gap-3'>
        {activeExpenses.map((expense) => (
          <ExpenseCard key={expense.id} {...expense} />
        ))}
        <ArchivedExpensesControl
          showArchived={showArchived}
          isLoading={isLoadingArchived}
          error={archivedError}
          onShow={loadArchivedExpenses}
          onHide={() => setShowArchived(false)}
        />
        {showArchived && archived.length > 0 && (
          <>
            <div className='flex items-center gap-3 py-2' role='separator' aria-label='Archived expenses'>
              <span className='h-px flex-1 bg-border' />
              <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Archived</span>
              <span className='h-px flex-1 bg-border' />
            </div>
            {archived.map((expense) => (
              <ExpenseCard key={expense.id} {...expense} />
            ))}
          </>
        )}
        {showArchived && archived.length === 0 && !isLoadingArchived && !archivedError && (
          <p className='text-center text-sm text-muted-foreground'>No archived expenses.</p>
        )}
      </div>
    </>
  )
}

function ArchivedExpensesControl({
  showArchived,
  isLoading,
  error,
  onShow,
  onHide,
}: {
  showArchived: boolean
  isLoading: boolean
  error: string | null
  onShow: () => void
  onHide: () => void
}) {
  return (
    <div className='flex flex-col items-center gap-2'>
      <Button
        type='button'
        className='min-h-11 bg-muted text-foreground hover:bg-muted/80'
        onClick={showArchived ? onHide : onShow}
        disabled={isLoading}
      >
        {isLoading ? 'Loading archived expenses…' : showArchived ? 'Hide archived' : 'Show archived'}
      </Button>
      {error && <p role='alert' className='text-sm text-destructive'>{error}</p>}
    </div>
  )
}

export default memo(ExpensesList)
