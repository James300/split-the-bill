'use client'

import { useState } from 'react'
import { Archive } from 'lucide-react'
import { authSession } from '@/lib/auth/server-session'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import IconButton from '@/components/IconButton/IconButton'
import { useExpenseBalances } from '@/hooks/useExpenseBalances/useExpenseBalances'
import { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'
import { useExpenseStore } from '@/store/ExpensesStore/ExpensesStore'
import { formatMinorCurrencyAmount } from '@/lib/utils/money'

export default function ExpenseArchiveAction({
  expenseId,
  creatorId,
  currency,
  pageRefreshKey,
  onArchived,
}: {
  expenseId: string
  creatorId: string
  currency: string
  pageRefreshKey: number
  onArchived: () => void
}) {
  const { data: session } = authSession.useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { balances, isLoading, error: balanceError, retry } = useExpenseBalances(
    expenseId,
    isOpen,
    0,
    pageRefreshKey,
  )
  const { members } = useExpenseMembers(expenseId, isOpen, pageRefreshKey)
  const { updateExpense } = useExpenseStore()

  if (session?.user?.id !== creatorId) return null

  const hasUnresolvedBalances = balances?.some((balance) => balance.amountNet !== 0) ?? false
  const memberNames = new Map(members.map((member) => [member.id, member.name]))

  const archiveExpense = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/expenses/${expenseId}/archive`, { method: 'POST' })
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null)
        const message = typeof body === 'object' && body !== null && 'error' in body
          && typeof body.error === 'string'
          ? body.error
          : 'Could not archive this expense.'
        throw new Error(message)
      }

      updateExpense(expenseId, { archivedAt: Date.now() })
      setIsOpen(false)
      onArchived()
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Could not archive this expense.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <IconButton
        type='button'
        aria-label='Archive expense'
        title='Archive expense'
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        onClick={() => {
          setError(null)
          setIsOpen(true)
        }}
        className='h-11 w-11 p-0'
      >
        <Archive aria-hidden='true' size={18} />
      </IconButton>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!isSaving) setIsOpen(open)
        }}
        title='Archive this expense?'
        description='Archiving is permanent. Members will still be able to view the expense, balances, and activity, but no one will be able to change it.'
      >
        <div className='flex flex-col gap-4'>
          {isLoading && balances === null && (
            <p role='status' className='text-sm text-muted-foreground'>Checking expense balances…</p>
          )}
          {balanceError && (
            <div className='flex flex-col gap-2'>
              <p role='alert' className='text-sm text-destructive'>{balanceError}</p>
              <Button type='button' className='min-h-11 self-start' onClick={retry}>Try again</Button>
            </div>
          )}
          {balances && hasUnresolvedBalances && (
            <div className='rounded-lg border border-amber-600/50 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-100'>
              <p className='font-semibold'>There are unresolved balances.</p>
              <ul className='mt-2 flex flex-col gap-1'>
                {balances.filter((balance) => balance.amountNet !== 0).map((balance) => (
                  <li key={balance.userId}>
                    {balance.amountNet < 0
                      ? `${memberNames.get(balance.userId) ?? 'A member'} owes the group ${formatMinorCurrencyAmount(Math.abs(balance.amountNet), currency)}`
                      : `The group owes ${memberNames.get(balance.userId) ?? 'a member'} ${formatMinorCurrencyAmount(balance.amountNet, currency)}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {balances && !hasUnresolvedBalances && (
            <p className='rounded-lg border border-border bg-muted/40 p-3 text-sm'>
              All member balances are settled.
            </p>
          )}
          {error && <p role='alert' className='text-sm text-destructive'>{error}</p>}
          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              className='min-h-11'
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              className='min-h-11'
              onClick={() => void archiveExpense()}
              disabled={isSaving || isLoading || !balances || Boolean(balanceError)}
            >
              {isSaving ? 'Archiving…' : 'Archive expense'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
