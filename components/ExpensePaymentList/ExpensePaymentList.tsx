'use client'

import Button from '@/components/Button'
import ExpensePaymentListPlaceholder from '@/components/ExpensePaymentList/ExpensePaymentListPlaceholder'
import { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'
import { useExpensePayments } from '@/hooks/useExpensePayments/useExpensePayments'
import { formatMinorCurrencyAmount } from '@/lib/utils/money'

function formatPaymentDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

export default function ExpensePaymentList({
  expenseId,
  refreshKey,
}: {
  expenseId: string
  refreshKey: number
}) {
  const membersState = useExpenseMembers(expenseId, true)
  const paymentsState = useExpensePayments(expenseId, refreshKey)
  const { members, currency, isLoading: membersLoading, error: membersError, reload: reloadMembers } = membersState
  const { payments, allocations, isLoading, error, retry } = paymentsState
  const membersById = new Map(members.map((member) => [member.id, member.name]))
  const allocationsByPayment = new Map<number, typeof allocations>()

  for (const allocation of allocations) {
    const current = allocationsByPayment.get(allocation.payment_id) ?? []
    current.push(allocation)
    allocationsByPayment.set(allocation.payment_id, current)
  }

  if (members.length === 0 && membersError) {
    return (
      <div className='flex flex-col gap-3'>
        <p role='alert' className='text-sm text-destructive'>{membersError}</p>
        <Button type='button' className='min-h-11 self-start' onClick={reloadMembers}>Try again</Button>
      </div>
    )
  }

  if ((members.length === 0 && (membersLoading || isLoading))
    || (isLoading && payments.length === 0)) {
    return <ExpensePaymentListPlaceholder />
  }

  if (members.length === 0 || !currency) {
    return <p role='alert' className='text-sm text-destructive'>Expense members or currency are unavailable.</p>
  }

  return (
    <section aria-labelledby='expense-payments-heading' className='flex flex-col gap-3'>
      <h2 id='expense-payments-heading' className='text-lg font-semibold'>Payments</h2>

      {error && (
        <div className='flex flex-col gap-3 rounded-lg border border-destructive/40 p-4'>
          <p role='alert' className='text-sm text-destructive'>{error}</p>
          <Button type='button' className='min-h-11 self-start' onClick={retry}>Try again</Button>
        </div>
      )}

      {!isLoading && !error && payments.length === 0 && (
        <p className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
          No payments yet. Add the first expense item using the plus button above.
        </p>
      )}

      {payments.length > 0 && (
        <ol className='flex flex-col gap-3' aria-label='Expense payments, newest first' aria-busy={isLoading}>
          {payments.map((payment) => {
            const paymentAllocations = allocationsByPayment.get(payment.id) ?? []

            return (
              <li key={payment.id} className='rounded-lg border border-border p-4'>
                <article className='flex flex-col gap-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <h3 className='break-words font-medium'>{payment.description || 'Expense item'}</h3>
                      <p className='text-sm text-muted-foreground'>
                        Paid by {membersById.get(payment.paidByUserId) ?? 'Unknown member'}
                      </p>
                    </div>
                    <p className='shrink-0 font-semibold'>
                      {formatMinorCurrencyAmount(payment.amount, currency)}
                    </p>
                  </div>

                  <p className='text-xs text-muted-foreground'>{formatPaymentDate(payment.createdAt)}</p>

                  <div className='border-t border-border pt-3'>
                    <h4 className='mb-2 text-sm font-medium'>Shares</h4>
                    {paymentAllocations.length > 0 ? (
                      <ul className='flex flex-col gap-1.5'>
                        {paymentAllocations.map((allocation) => (
                          <li
                            key={`${allocation.payment_id}-${allocation.user_id}`}
                            className='flex items-start justify-between gap-3 text-sm'
                          >
                            <span className='min-w-0 break-words'>
                              {membersById.get(allocation.user_id) ?? 'Unknown member'}
                            </span>
                            <span className='shrink-0'>
                              {formatMinorCurrencyAmount(allocation.amount, currency)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className='text-sm text-muted-foreground'>No participant shares are available.</p>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
