'use client'

import { useMemo, useState } from 'react'
import { CircleDollarSign } from 'lucide-react'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import IconButton from '@/components/IconButton/IconButton'
import ExpenseSettlementManager from '@/components/ExpenseSettlementManager/ExpenseSettlementManager'
import { useExpenseBalances } from '@/hooks/useExpenseBalances/useExpenseBalances'
import { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'
import { formatMinorCurrencyAmount } from '@/lib/utils/money'
import type { ExpenseSettlementRecord } from '@/hooks/useExpenseSettlements/useExpenseSettlements'

export default function ExpenseBalanceAction({
  expenseId,
  onSettled,
  editingSettlement,
  onEditComplete,
  refreshKey,
}: {
  expenseId: string
  onSettled: () => void
  editingSettlement?: ExpenseSettlementRecord
  onEditComplete: () => void
  refreshKey: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreatingSettlement, setIsCreatingSettlement] = useState(false)
  const isDialogOpen = isOpen || Boolean(editingSettlement)
  const membersState = useExpenseMembers(expenseId, isDialogOpen)
  const balancesState = useExpenseBalances(expenseId, isDialogOpen, refreshKey)
  const { members, currency, isLoading: membersLoading, error: membersError, reload: reloadMembers } = membersState
  const { balances, isLoading: balancesLoading, error: balancesError, retry: retryBalances } = balancesState

  const currentMember = members.find((member) => member.isCurrentUser)
  const currentBalance = balances?.find((balance) => balance.userId === currentMember?.id)
  const otherMembers = members.filter((member) => !member.isCurrentUser)
  const transferAmounts = useMemo(() => {
    const transfers = new Map<string, number>()
    if (!currentMember || currentBalance === undefined || !balances) return transfers

    const remaining = Math.abs(currentBalance.amountNet)
    const counterparties = balances
      .filter((balance) => balance.userId !== currentMember.id
        && (currentBalance.amountNet > 0 ? balance.amountNet < 0 : balance.amountNet > 0))
      .sort((left, right) => left.userId < right.userId ? -1 : left.userId > right.userId ? 1 : 0)

    let amountRemaining = remaining
    for (const counterparty of counterparties) {
      if (amountRemaining === 0) break
      const amount = Math.min(amountRemaining, Math.abs(counterparty.amountNet))
      transfers.set(counterparty.userId, amount)
      amountRemaining -= amount
    }
    return transfers
  }, [balances, currentBalance, currentMember])

  const isLoading = membersLoading || balancesLoading
  const hasError = Boolean(membersError || balancesError)

  return (
    <>
      <IconButton
        type='button'
        aria-label='View expense balances'
        title='View expense balances'
        aria-haspopup='dialog'
        aria-expanded={isDialogOpen}
        onClick={() => setIsOpen(true)}
        className='h-11 w-11 p-0'
      >
        <CircleDollarSign aria-hidden='true' size={19} />
      </IconButton>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open && editingSettlement) onEditComplete()
        }}
        title={editingSettlement ? 'Edit settlement' : 'Your balance'}
        description={editingSettlement
          ? 'Update the settlement details.'
          : 'See the suggested amounts between you and each other member.'}
        className='max-h-[90dvh] overflow-y-auto'
      >
        <section aria-label='Your expense balance breakdown' aria-busy={isLoading} className='flex flex-col gap-4'>
          {isLoading && (balances === null || members.length === 0) && (
            <p role='status' className='text-sm text-muted-foreground'>Loading balances…</p>
          )}

          {membersError && <p role='alert' className='text-sm text-destructive'>{membersError}</p>}
          {balancesError && <p role='alert' className='text-sm text-destructive'>{balancesError}</p>}

          {hasError && (
            <Button
              type='button'
              className='min-h-11 self-start'
              onClick={() => {
                void reloadMembers()
                retryBalances()
              }}
            >
              Try again
            </Button>
          )}

          {members.length > 0 && balances !== null && !currency && (
            <p role='alert' className='text-sm text-destructive'>The expense currency is unavailable.</p>
          )}

          {members.length > 0 && balances !== null && currency && !currentMember && (
            <p role='alert' className='text-sm text-destructive'>Your expense membership could not be identified.</p>
          )}

          {members.length > 0 && balances !== null && currency && currentMember && currentBalance && (
            <>
              {otherMembers.length > 1 && (
                <div className='rounded-lg border border-border bg-muted/30 p-4'>
                  <p className='text-sm font-medium'>Your net across this expense</p>
                  <p className='mt-1 text-lg font-semibold'>
                    {currentBalance.amountNet > 0
                      ? `You are owed ${formatMinorCurrencyAmount(currentBalance.amountNet, currency)} overall`
                      : currentBalance.amountNet < 0
                        ? `You owe ${formatMinorCurrencyAmount(Math.abs(currentBalance.amountNet), currency)} overall`
                        : 'You are settled up overall'}
                  </p>
                </div>
              )}

              {otherMembers.length === 0 ? (
                <p className='text-sm text-muted-foreground'>You are the only member of this expense.</p>
              ) : (
                <ul className='flex flex-col gap-2' aria-label='Suggested amounts involving you'>
                  {otherMembers.map((member) => {
                    const amount = transferAmounts.get(member.id) ?? 0

                    return (
                      <li key={member.id} className='flex min-h-12 items-center justify-between gap-3 rounded-lg border border-border px-3 py-2'>
                        <span className='min-w-0 break-words text-sm font-medium'>{member.name}</span>
                        <span className='shrink-0 text-right text-sm'>
                          {amount > 0
                            ? currentBalance.amountNet > 0
                              ? `Owes you ${formatMinorCurrencyAmount(amount, currency)}`
                              : `You owe ${formatMinorCurrencyAmount(amount, currency)}`
                            : 'No amount to settle with you'}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}

              {currentBalance.amountNet < 0 && !editingSettlement && (
                <Button
                  type='button'
                  className='min-h-11 w-full'
                  onClick={() => setIsCreatingSettlement((current) => !current)}
                >
                  {isCreatingSettlement ? 'Back to balance' : 'Make a settlement'}
                </Button>
              )}

              {(isCreatingSettlement || editingSettlement) && (currentBalance.amountNet < 0 || editingSettlement) && (
                <ExpenseSettlementManager
                  key={editingSettlement?.id ?? 'new-settlement'}
                  expenseId={expenseId}
                  members={members}
                  balances={balances}
                  currency={currency}
                  currentUserId={currentMember.id}
                  initialSettlement={editingSettlement}
                  onCreated={() => {
                    setIsCreatingSettlement(false)
                    retryBalances()
                    onSettled()
                    if (editingSettlement) {
                      setIsOpen(false)
                      onEditComplete()
                    }
                  }}
                />
              )}
            </>
          )}

          {!isLoading && !hasError && members.length === 0 && (
            <p role='alert' className='text-sm text-destructive'>Expense members are unavailable.</p>
          )}
          {!isLoading && !hasError && members.length > 0 && balances !== null && currentMember && !currentBalance && (
            <p role='alert' className='text-sm text-destructive'>Your balance is unavailable.</p>
          )}
        </section>
      </Dialog>
    </>
  )
}
