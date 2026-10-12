'use client'

import { Fragment, useCallback } from 'react'
import Button from '@/components/Button'
import ExpensePaymentReadBoundary from '@/components/ExpensePaymentList/ExpensePaymentReadBoundary'
import ExpensePaymentListPlaceholder from '@/components/ExpensePaymentList/ExpensePaymentListPlaceholder'
import { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'
import { useExpensePayments } from '@/hooks/useExpensePayments/useExpensePayments'
import type { ExpensePaymentRecord } from '@/hooks/useExpensePayments/useExpensePayments'
import { useExpenseReadState } from '@/hooks/useExpenseReadState/useExpenseReadState'
import { useExpenseSettlements } from '@/hooks/useExpenseSettlements/useExpenseSettlements'
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
  const settlementsState = useExpenseSettlements(expenseId, refreshKey)
  const readState = useExpenseReadState(expenseId)
  const { members, currency, isLoading: membersLoading, error: membersError, reload: reloadMembers } = membersState
  const { payments, allocations, isLoading, error, retry } = paymentsState
  const {
    settlements,
    isLoading: settlementsLoading,
    error: settlementsError,
    retry: retrySettlements,
  } = settlementsState
  const currentMember = members.find((member) => member.isCurrentUser)
  const membersById = new Map(members.map((member) => [member.id, member.name]))
  const allocationsByPayment = new Map<number, typeof allocations>()

  for (const allocation of allocations) {
    const current = allocationsByPayment.get(allocation.payment_id) ?? []
    current.push(allocation)
    allocationsByPayment.set(allocation.payment_id, current)
  }

  const activities = [
    ...payments.map((payment) => ({
      kind: 'payment' as const,
      record: payment,
      createdAt: payment.createdAt,
    })),
    ...settlements.map((settlement) => ({
      kind: 'settlement' as const,
      record: settlement,
      createdAt: settlement.createdAt,
    })),
  ].sort((left, right) =>
    right.createdAt - left.createdAt
    || (left.kind === right.kind
      ? right.record.id - left.record.id
      : left.kind === 'settlement' ? -1 : 1),
  )

  const lastReadAt = readState.lastReadAt
  const unreadCount = lastReadAt === null
    ? 0
    : activities.filter((activity) => activity.createdAt > lastReadAt).length
  let readBoundaryIndex: number | null = null
  if (activities.length > 0 && lastReadAt !== null && !readState.isLoading) {
    const firstReadActivityIndex = activities.findIndex((activity) => activity.createdAt <= lastReadAt)
    if (unreadCount === 0) {
      readBoundaryIndex = 0
    } else if (firstReadActivityIndex >= 0) {
      readBoundaryIndex = firstReadActivityIndex
    } else {
      readBoundaryIndex = activities.length
    }
  }

  const markRead = readState.markRead
  const markActivityRead = useCallback(() => {
    const newestActivity = activities[0]
    if (newestActivity) {
      void markRead({
        activityType: newestActivity.kind,
        activityId: newestActivity.record.id,
      })
    }
  }, [activities, markRead])
  const showPaymentListLoading = payments.length === 0 && settlements.length === 0
    && (isLoading || settlementsLoading || readState.isLoading)

  if (members.length === 0 && membersError) {
    return (
      <div className='flex flex-col gap-3'>
        <p role='alert' className='text-sm text-destructive'>{membersError}</p>
        <Button type='button' className='min-h-11 self-start' onClick={reloadMembers}>Try again</Button>
      </div>
    )
  }

  if ((members.length === 0 && (membersLoading || showPaymentListLoading)) || showPaymentListLoading) {
    return <ExpensePaymentListPlaceholder />
  }

  if (members.length === 0 || !currency) {
    return <p role='alert' className='text-sm text-destructive'>Expense members or currency are unavailable.</p>
  }

  return (
    <section aria-labelledby='expense-payments-heading' className='flex flex-col gap-3'>
      <h2 id='expense-payments-heading' className='text-lg font-semibold'>Payments and settlements</h2>

      {(error || settlementsError) && (
        <div className='flex flex-col gap-3 rounded-lg border border-destructive/40 p-4'>
          <p role='alert' className='text-sm text-destructive'>{error ?? settlementsError}</p>
          <Button
            type='button'
            className='min-h-11 self-start'
            onClick={() => {
              if (error) retry()
              if (settlementsError) retrySettlements()
            }}
          >
            Try again
          </Button>
        </div>
      )}

      {readState.error && (
        <div className='flex flex-col gap-3 rounded-lg border border-destructive/40 p-4'>
          <p role='alert' className='text-sm text-destructive'>{readState.error}</p>
          <Button type='button' className='min-h-11 self-start' onClick={readState.retry}>
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !settlementsLoading && !error && !settlementsError
        && payments.length === 0 && settlements.length === 0 && (
          <p className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
            No payments or settlements yet. Add the first expense item using the plus button above.
          </p>
        )}

      {activities.length > 0 && (
        <ol
          className='flex flex-col gap-3'
          aria-label='Expense payments and settlements, newest first'
          aria-busy={isLoading || settlementsLoading || readState.isLoading}
        >
          {activities.map((activity, index) => (
            <Fragment key={`${activity.kind}-${activity.record.id}`}>
              {index === readBoundaryIndex && (
                <ExpensePaymentReadBoundary
                  key='read-boundary'
                  label={unreadCount > 0 ? 'New activity' : 'Already read'}
                  observesUnreadActivity={unreadCount > 0
                    && !readState.isMarking
                    && !readState.hasMarkedReadThisVisit
                    && !readState.error}
                  onVisible={markActivityRead}
                />
              )}
              {activity.kind === 'settlement' ? (
                <li className='rounded-lg border border-t-border border-r-border border-b-border border-l-4 border-l-activity-settlement p-4'>
                  <article className='flex flex-col gap-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <h3 className='font-medium'>Settlement</h3>
                        <p className='break-words text-sm text-muted-foreground'>
                          {membersById.get(activity.record.payerUserId) ?? 'Unknown member'} paid{' '}
                          {membersById.get(activity.record.payeeUserId) ?? 'Unknown member'}
                        </p>
                      </div>
                      <p className='shrink-0 font-semibold'>
                        {formatMinorCurrencyAmount(activity.record.amount, currency)}
                      </p>
                    </div>
                    <p className='text-xs text-muted-foreground'>{formatPaymentDate(activity.record.createdAt)}</p>
                  </article>
                </li>
              ) : (
                <PaymentActivity
                  payment={activity.record}
                  currentUserId={currentMember?.id}
                  membersById={membersById}
                  allocations={allocationsByPayment.get(activity.record.id) ?? []}
                  currency={currency}
                />
              )}
            </Fragment>
          ))}
          {readBoundaryIndex === activities.length && (
            <ExpensePaymentReadBoundary
              key='read-boundary'
              label={unreadCount > 0 ? 'New activity' : 'Already read'}
              observesUnreadActivity={unreadCount > 0
                && !readState.isMarking
                && !readState.hasMarkedReadThisVisit
                && !readState.error}
              onVisible={markActivityRead}
            />
          )}
        </ol>
      )}
    </section>
  )
}

function PaymentActivity({
  payment,
  currentUserId,
  membersById,
  allocations,
  currency,
}: {
  payment: ExpensePaymentRecord
  currentUserId?: string
  membersById: Map<string, string>
  allocations: { payment_id: number; user_id: string; amount: number }[]
  currency: string
}) {
  const currentUserShare = allocations
    .filter((allocation) => allocation.user_id === currentUserId)
    .reduce((total, allocation) => total + allocation.amount, 0)
  const currentUserNet = (payment.paidByUserId === currentUserId ? payment.amount : 0) - currentUserShare
  const borderClass = currentUserNet > 0
    ? 'border-l-activity-credit'
    : currentUserNet < 0
      ? 'border-l-activity-debt'
      : ''

  return (
    <li className={`rounded-lg border border-t-border border-r-border border-b-border p-4 ${borderClass ? `border-l-4 ${borderClass}` : ''}`}>
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
          {allocations.length > 0 ? (
            <ul className='flex flex-col gap-1.5'>
              {allocations.map((allocation) => (
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
}
