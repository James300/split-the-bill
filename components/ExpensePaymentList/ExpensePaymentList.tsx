'use client'

import { Fragment } from 'react'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Button from '@/components/Button'
import ExpensePaymentReadBoundary from '@/components/ExpensePaymentList/ExpensePaymentReadBoundary'
import ExpensePaymentListPlaceholder from '@/components/ExpensePaymentList/ExpensePaymentListPlaceholder'
import { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'
import { useExpensePayments } from '@/hooks/useExpensePayments/useExpensePayments'
import type { ExpensePaymentRecord } from '@/hooks/useExpensePayments/useExpensePayments'
import { useExpenseReadState } from '@/hooks/useExpenseReadState/useExpenseReadState'
import { useExpenseSettlements } from '@/hooks/useExpenseSettlements/useExpenseSettlements'
import { formatMinorCurrencyAmount } from '@/lib/utils/money'
import ExpenseLedgerItemActions from '@/components/ExpenseLedgerItemActions/ExpenseLedgerItemActions'
import type { ExpenseSettlementRecord } from '@/hooks/useExpenseSettlements/useExpenseSettlements'
import type { PaymentAllocationRecord } from '@/hooks/useExpensePayments/useExpensePayments'

function formatPaymentDate(value: number | string) {
  const date = typeof value === 'number' ? new Date(value) : new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(date)
}

function compareActivityOrder(
  left: { date: string; id: number; kind: 'payment' | 'settlement' },
  right: { date: string; id: number; kind: 'payment' | 'settlement' },
) {
  return right.date.localeCompare(left.date)
    || right.id - left.id
    || (left.kind === right.kind ? 0 : left.kind === 'settlement' ? -1 : 1)
}

export default function ExpensePaymentList({
  expenseId,
  refreshKey,
  onEditPayment,
  onEditSettlement,
  onActivityChanged,
}: {
  expenseId: string
  refreshKey: number
  onEditPayment: (payment: ExpensePaymentRecord, allocations: PaymentAllocationRecord[]) => void
  onEditSettlement: (settlement: ExpenseSettlementRecord) => void
  onActivityChanged: () => void
}) {
  const membersState = useExpenseMembers(expenseId, true)
  const paymentsState = useExpensePayments(expenseId, refreshKey)
  const settlementsState = useExpenseSettlements(expenseId, refreshKey)
  const readState = useExpenseReadState(expenseId)
  const [showSettledHistory, setShowSettledHistory] = useState(false)
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
      id: payment.id,
      date: payment.date,
      createdAt: payment.createdAt,
    })),
    ...settlements.map((settlement) => ({
      kind: 'settlement' as const,
      record: settlement,
      id: settlement.id,
      date: settlement.date,
      createdAt: settlement.createdAt,
    })),
  ].sort(compareActivityOrder)
  const activityBalances = new Map<string, number>()
  let settledByActivityId: number | null = null
  const chronologicalActivities = [...activities]
    .filter((activity) => !activity.record.deletedAt)
    .sort((left, right) =>
      left.createdAt - right.createdAt
      || left.id - right.id
      || (left.kind === right.kind ? 0 : left.kind === 'payment' ? -1 : 1),
    )

  for (const activity of chronologicalActivities) {
    if (activity.kind === 'payment') {
      const payment = activity.record
      activityBalances.set(
        payment.paidByUserId,
        (activityBalances.get(payment.paidByUserId) ?? 0) + payment.amount,
      )
      for (const allocation of allocationsByPayment.get(payment.id) ?? []) {
        activityBalances.set(
          allocation.user_id,
          (activityBalances.get(allocation.user_id) ?? 0) - allocation.amount,
        )
      }
    } else {
      const settlement = activity.record
      activityBalances.set(
        settlement.payerUserId,
        (activityBalances.get(settlement.payerUserId) ?? 0) + settlement.amount,
      )
      activityBalances.set(
        settlement.payeeUserId,
        (activityBalances.get(settlement.payeeUserId) ?? 0) - settlement.amount,
      )
      if ([...activityBalances.values()].every((balance) => balance === 0)) {
        settledByActivityId = settlement.id
      }
    }
  }
  const isFullySettled = settledByActivityId !== null
    && [...activityBalances.values()].every((balance) => balance === 0)
  const settledActivityIndex = isFullySettled
    ? activities.findIndex((activity) =>
      activity.kind === 'settlement' && activity.id === settledByActivityId,
    )
    : -1
  const visibleActivities = settledActivityIndex >= 0
    ? activities.slice(0, settledActivityIndex + 1)
    : activities
  const renderedActivities = isFullySettled && showSettledHistory
    ? activities
    : visibleActivities

  const lastReadAt = readState.lastReadAt
  const lastReadActivity = readState.lastReadActivity
  let readBoundaryIndex: number | null = null
  if (visibleActivities.length > 0 && lastReadAt !== null && !readState.isLoading) {
    if (lastReadActivity) {
      const lastReadIndex = visibleActivities.findIndex((activity) =>
        activity.kind === lastReadActivity.activityType
        && activity.record.id === lastReadActivity.activityId,
      )
      readBoundaryIndex = lastReadIndex >= 0
        ? lastReadIndex
        : visibleActivities.findIndex((activity) => compareActivityOrder(activity, {
          date: lastReadActivity.activityDate,
          id: lastReadActivity.activityId,
          kind: lastReadActivity.activityType,
        }) > 0)
      if (readBoundaryIndex < 0) readBoundaryIndex = visibleActivities.length
    } else {
      const firstReadActivityIndex = visibleActivities.findIndex((activity) => activity.createdAt <= lastReadAt)
      readBoundaryIndex = firstReadActivityIndex >= 0 ? firstReadActivityIndex : visibleActivities.length
    }
  }
  const unreadCount = isFullySettled
    ? Math.max(0, settledActivityIndex + 1 - (readBoundaryIndex ?? 0))
    : readBoundaryIndex ?? 0
  if (isFullySettled) readBoundaryIndex = settledActivityIndex + 1

  const markRead = readState.markRead
  const markActivityRead = () => {
    const newestActivity = activities[0]
    if (newestActivity) {
      void markRead({
        activityType: newestActivity.kind,
        activityId: newestActivity.record.id,
      })
    }
  }
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
      {unreadCount > 0 && !readState.isLoading && (
        <div
          role='status'
          aria-label={`${unreadCount} unread ${unreadCount === 1 ? 'activity' : 'activities'}`}
          className='flex items-center gap-3 py-1 text-xs font-semibold text-primary'
        >
          <span aria-hidden='true' className='h-px flex-1 bg-primary/60' />
          <span>Unread activity</span>
          <span aria-hidden='true' className='h-px flex-1 bg-primary/60' />
        </div>
      )}
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

      {renderedActivities.length > 0 && (
        <ol
          className='flex flex-col gap-3'
          aria-label='Expense payments and settlements, newest first'
          aria-busy={isLoading || settlementsLoading || readState.isLoading}
        >
          {renderedActivities.map((activity, index) => (
            <Fragment key={`${activity.kind}-${activity.record.id}`}>
              {index === readBoundaryIndex && (
                <ExpensePaymentReadBoundary
                  key='read-boundary'
                  label={isFullySettled ? 'All paid' : unreadCount > 0 ? 'New activity' : 'Already read'}
                  observesUnreadActivity={unreadCount > 0
                    && !readState.isLoading
                    && !readState.isMarking
                    && !readState.hasMarkedReadThisVisit
                    && !readState.error}
                  onVisible={markActivityRead}
                  actionLabel={isFullySettled && !showSettledHistory ? 'Show earlier activity' : undefined}
                  onAction={isFullySettled && !showSettledHistory
                    ? () => setShowSettledHistory(true)
                    : undefined}
                />
              )}
              {activity.kind === 'settlement' ? (
                <li className={`rounded-lg border border-t-border border-r-border border-b-border p-4 ${activity.record.deletedAt ? 'border-l-4 border-l-muted-foreground' : 'border-l-4 !border-l-activity-settlement'}`}>
                  <article className='flex flex-col gap-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <h3 className='font-medium'>{activity.record.deletedAt ? 'Settlement deleted' : 'Settlement'}</h3>
                        <p className='break-words text-sm text-muted-foreground'>
                          {membersById.get(activity.record.payerUserId) ?? 'Unknown member'} paid{' '}
                          {membersById.get(activity.record.payeeUserId) ?? 'Unknown member'}
                        </p>
                      </div>
                      <p className='shrink-0 font-semibold'>
                        {formatMinorCurrencyAmount(activity.record.amount, currency)}
                      </p>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {activity.record.deletedAt
                        ? `Deleted ${formatPaymentDate(activity.record.deletedAt)} · Recorded ${formatPaymentDate(activity.record.date)}`
                        : formatPaymentDate(activity.record.date)}
                    </p>
                    {!activity.record.deletedAt && activity.record.createdByUserId === currentMember?.id && (
                      <ExpenseLedgerItemActions
                        itemType='settlement'
                        itemId={activity.record.id}
                        onEdit={() => onEditSettlement(activity.record)}
                        onDeleted={onActivityChanged}
                      />
                    )}
                  </article>
                </li>
              ) : (
                <PaymentActivity
                  payment={activity.record}
                  currentUserId={currentMember?.id}
                  membersById={membersById}
                  allocations={allocationsByPayment.get(activity.record.id) ?? []}
                  currency={currency}
                  isDeleted={Boolean(activity.record.deletedAt)}
                  canEdit={activity.record.createdByUserId === currentMember?.id}
                  onEdit={() => onEditPayment(activity.record, allocationsByPayment.get(activity.record.id) ?? [])}
                  onDeleted={onActivityChanged}
                />
              )}
            </Fragment>
          ))}
          {readBoundaryIndex === renderedActivities.length && (
            <ExpensePaymentReadBoundary
              key='read-boundary'
              label={isFullySettled ? 'All paid' : unreadCount > 0 ? 'New activity' : 'Already read'}
              observesUnreadActivity={unreadCount > 0
                && !readState.isLoading
                && !readState.isMarking
                && !readState.hasMarkedReadThisVisit
                && !readState.error}
              onVisible={markActivityRead}
              actionLabel={isFullySettled && !showSettledHistory ? 'Show earlier activity' : undefined}
              onAction={isFullySettled && !showSettledHistory
                ? () => setShowSettledHistory(true)
                : undefined}
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
  isDeleted,
  canEdit,
  onEdit,
  onDeleted,
}: {
  payment: ExpensePaymentRecord
  currentUserId?: string
  membersById: Map<string, string>
  allocations: { payment_id: number; user_id: string; amount: number }[]
  currency: string
  isDeleted: boolean
  canEdit: boolean
  onEdit: () => void
  onDeleted: () => void
}) {
  const currentUserShare = allocations
    .filter((allocation) => allocation.user_id === currentUserId)
    .reduce((total, allocation) => total + allocation.amount, 0)
  const currentUserNet = (payment.paidByUserId === currentUserId ? payment.amount : 0) - currentUserShare
  const borderClass = isDeleted
    ? 'border-l-4 border-l-muted-foreground'
    : currentUserNet > 0
    ? '!border-l-activity-credit'
    : currentUserNet < 0
      ? '!border-l-activity-debt'
      : ''

  const details = (
    <div>
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
  )

  return (
    <li className={`rounded-lg border border-t-border border-r-border border-b-border p-4 ${borderClass ? `border-l-4 ${borderClass}` : ''}`}>
      <details className='group'>
        <summary className='flex min-h-11 cursor-pointer list-none flex-col gap-2 [&::-webkit-details-marker]:hidden'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <span className='block break-words font-medium'>{isDeleted ? 'Payment deleted' : payment.description || 'Expense item'}</span>
              {!isDeleted && (
                <p className='text-sm text-muted-foreground'>
                  Paid by {membersById.get(payment.paidByUserId) ?? 'Unknown member'}
                </p>
              )}
            </div>
            {!isDeleted && <p className='shrink-0 font-semibold'>{formatMinorCurrencyAmount(payment.amount, currency)}</p>}
          </div>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-xs text-muted-foreground'>
              {isDeleted
                ? `Deleted ${payment.deletedAt ? formatPaymentDate(payment.deletedAt) : ''}`
                : formatPaymentDate(payment.date)}
            </p>
            <ChevronDown aria-hidden='true' size={16} className='shrink-0 text-muted-foreground transition-transform group-open:rotate-180' />
          </div>
        </summary>
        <div className='mt-3 flex flex-col gap-3 border-t border-border pt-3'>
          {isDeleted ? (
            <details className='rounded-md border border-border px-3 py-2'>
              <summary className='min-h-11 cursor-pointer py-3 text-sm font-medium'>View deleted payment details</summary>
              <div className='flex flex-col gap-3 pb-2'>
                <p className='break-words text-sm'>{payment.description || 'Expense item'}</p>
                <p className='text-sm'>Paid by {membersById.get(payment.paidByUserId) ?? 'Unknown member'}</p>
                <p className='font-semibold'>{formatMinorCurrencyAmount(payment.amount, currency)}</p>
                <p className='text-xs text-muted-foreground'>Recorded {formatPaymentDate(payment.date)}</p>
                {details}
              </div>
            </details>
          ) : (
            <>
              {details}
              {canEdit && (
                <ExpenseLedgerItemActions
                  itemType='payment'
                  itemId={payment.id}
                  onEdit={onEdit}
                  onDeleted={onDeleted}
                />
              )}
            </>
          )}
        </div>
      </details>
    </li>
  )
}
