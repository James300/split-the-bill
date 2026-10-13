'use client'

import { useMemo, useState } from 'react'
import { CircleDollarSign } from 'lucide-react'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import IconButton from '@/components/IconButton/IconButton'
import ExpenseSettlementManager from '@/components/ExpenseSettlementManager/ExpenseSettlementManager'
import PaymentShareBreakdown from '@/components/PaymentShareBreakdown/PaymentShareBreakdown'
import { useExpenseBalances } from '@/hooks/useExpenseBalances/useExpenseBalances'
import { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'
import { useExpensePayments } from '@/hooks/useExpensePayments/useExpensePayments'
import { formatMinorCurrencyAmount } from '@/lib/utils/money'
import type { ExpenseSettlementRecord } from '@/hooks/useExpenseSettlements/useExpenseSettlements'

export default function ExpenseBalanceAction({
  expenseId,
  onSettled,
  editingSettlement,
  onEditComplete,
  refreshKey,
  pageRefreshKey,
  isArchived = false,
}: {
  expenseId: string
  onSettled: () => void
  editingSettlement?: ExpenseSettlementRecord
  onEditComplete: () => void
  refreshKey: number
  pageRefreshKey: number
  isArchived?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreatingSettlement, setIsCreatingSettlement] = useState(false)
  const isEditingSettlement = Boolean(editingSettlement) && !isArchived
  const isDialogOpen = isOpen || isEditingSettlement
  const membersState = useExpenseMembers(expenseId, isDialogOpen, pageRefreshKey)
  const balancesState = useExpenseBalances(expenseId, isDialogOpen, refreshKey, pageRefreshKey)
  const paymentsState = useExpensePayments(expenseId, refreshKey, isDialogOpen, pageRefreshKey)
  const { members, currency, isLoading: membersLoading, error: membersError, reload: reloadMembers } = membersState
  const { balances, isLoading: balancesLoading, error: balancesError, retry: retryBalances } = balancesState
  const {
    payments,
    allocations,
    isLoading: paymentsLoading,
    error: paymentsError,
    retry: retryPayments,
  } = paymentsState

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
  const hasError = Boolean(membersError || balancesError || paymentsError)
  const activePayments = payments.filter((payment) => !payment.deletedAt)
  const activePaymentIds = new Set(activePayments.map((payment) => payment.id))
  const totalSpent = activePayments.reduce((total, payment) => total + payment.amount, 0)
  const sharesByMember = new Map<string, number>()
  for (const allocation of allocations) {
    if (activePaymentIds.has(allocation.payment_id)) {
      sharesByMember.set(
        allocation.user_id,
        (sharesByMember.get(allocation.user_id) ?? 0) + allocation.amount,
      )
    }
  }
  const membersById = new Map(members.map((member) => [member.id, member.name]))
  const aggregateShares = [...members]
    .sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
    .map((member) => ({ userId: member.id, amount: sharesByMember.get(member.id) ?? 0 }))

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
          if (!open && isEditingSettlement) onEditComplete()
        }}
        title={isEditingSettlement ? 'Edit settlement' : 'Your balance'}
        description={isEditingSettlement
          ? 'Update the settlement details.'
          : 'See the suggested amounts between you and each other member.'}
        className='max-h-[90dvh] overflow-y-auto'
      >
        <section aria-label='Your expense balance breakdown' aria-busy={isLoading || paymentsLoading} className='flex flex-col gap-4'>
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
                retryPayments()
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
              {!isCreatingSettlement && !isEditingSettlement && (
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

                  <div className='flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4'>
                    <div className='flex items-center justify-between gap-3'>
                      <h3 className='text-sm font-medium'>Total spent</h3>
                      {!paymentsLoading && !paymentsError && (
                        <p className='shrink-0 text-lg font-semibold'>
                          {formatMinorCurrencyAmount(totalSpent, currency)}
                        </p>
                      )}
                    </div>
                    {paymentsLoading ? (
                      <p role='status' className='text-sm text-muted-foreground'>Loading spending breakdown…</p>
                    ) : paymentsError ? (
                      <p role='alert' className='text-sm text-destructive'>{paymentsError}</p>
                    ) : (
                      <PaymentShareBreakdown
                        shares={aggregateShares}
                        membersById={membersById}
                        currency={currency}
                        title='Total share by member'
                      />
                    )}
                  </div>

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

                </>
              )}

              {currentBalance.amountNet < 0 && !isEditingSettlement && !isArchived && (
                <Button
                  type='button'
                  className='min-h-11 w-full'
                  onClick={() => setIsCreatingSettlement((current) => !current)}
                >
                  {isCreatingSettlement ? 'Back to balance' : 'Make a settlement'}
                </Button>
              )}

              {!isArchived && (isCreatingSettlement || isEditingSettlement) && (currentBalance.amountNet < 0 || isEditingSettlement) && (
                <ExpenseSettlementManager
                  key={isEditingSettlement ? editingSettlement?.id ?? 'new-settlement' : 'new-settlement'}
                  expenseId={expenseId}
                  members={members}
                  balances={balances}
                  currency={currency}
                  currentUserId={currentMember.id}
                  initialSettlement={isEditingSettlement ? editingSettlement : undefined}
                  onCreated={() => {
                    setIsCreatingSettlement(false)
                    retryBalances()
                    onSettled()
                    if (isEditingSettlement) {
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
