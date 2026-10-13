'use client'

import { useState } from 'react'
import ExpenseBalanceAction from '@/components/ExpenseBalanceAction/ExpenseBalanceAction'
import ExpenseArchiveAction from '@/components/ExpenseArchiveAction/ExpenseArchiveAction'
import ExpenseMembersAction from '@/components/ExpenseMembersAction/ExpenseMembersAction'
import ExpensePaymentAction from '@/components/ExpensePaymentAction/ExpensePaymentAction'
import ExpenseShareAction from '@/components/ExpenseShareAction/ExpenseShareAction'
import Page from '@/components/Page/Page'
import ExpensePaymentList from '@/components/ExpensePaymentList/ExpensePaymentList'
import ExpenseContainer from '@/containers/Expense/Expense'
import { useRefreshWhenActive } from '@/hooks/useRefreshWhenActive/useRefreshWhenActive'
import type { ExpensePaymentRecord, PaymentAllocationRecord } from '@/hooks/useExpensePayments/useExpensePayments'
import type { ExpenseSettlementRecord } from '@/hooks/useExpenseSettlements/useExpenseSettlements'
import { useExpense } from '@/store/ExpensesStore/ExpensesStore'

export default function ExpensePageContent({ expenseId }: { expenseId: string }) {
  const expense = useExpense(expenseId)
  const [paymentsRefreshKey, setPaymentsRefreshKey] = useState(0)
  const [pageRefreshKey, setPageRefreshKey] = useState(0)
  const [editingPayment, setEditingPayment] = useState<{
    payment: ExpensePaymentRecord
    allocations: PaymentAllocationRecord[]
  } | null>(null)
  const [editingSettlement, setEditingSettlement] = useState<ExpenseSettlementRecord | null>(null)

  const refreshActivity = () => setPaymentsRefreshKey((current) => current + 1)

  useRefreshWhenActive(() => setPageRefreshKey((current) => current + 1))

  return (
    <Page
      title={<ExpenseContainer id={expenseId} pageRefreshKey={pageRefreshKey} />}
      titleActions={(
        <>
          <ExpensePaymentAction
            expenseId={expenseId}
            isArchived={Boolean(expense?.archivedAt)}
            onCreated={refreshActivity}
            editingPayment={editingPayment?.payment}
            editingAllocations={editingPayment?.allocations}
            onEditComplete={() => setEditingPayment(null)}
            pageRefreshKey={pageRefreshKey}
          />
          <ExpenseBalanceAction
            expenseId={expenseId}
            isArchived={Boolean(expense?.archivedAt)}
            onSettled={refreshActivity}
            editingSettlement={editingSettlement ?? undefined}
            onEditComplete={() => setEditingSettlement(null)}
            refreshKey={paymentsRefreshKey}
            pageRefreshKey={pageRefreshKey}
          />
          <ExpenseMembersAction
            expenseId={expenseId}
            isArchived={Boolean(expense?.archivedAt)}
            pageRefreshKey={pageRefreshKey}
          />
          {!expense?.archivedAt && <ExpenseShareAction expenseId={expenseId} />}
          {!expense?.archivedAt && expense?.createdByUserId && (
            <ExpenseArchiveAction
              expenseId={expenseId}
              creatorId={expense.createdByUserId}
              currency={expense.currency}
              pageRefreshKey={pageRefreshKey}
              onArchived={() => setPageRefreshKey((current) => current + 1)}
            />
          )}
        </>
      )}
    >
      <ExpensePaymentList
        expenseId={expenseId}
        refreshKey={paymentsRefreshKey}
        pageRefreshKey={pageRefreshKey}
        isArchived={Boolean(expense?.archivedAt)}
        onEditPayment={(payment, allocations) => setEditingPayment({ payment, allocations })}
        onEditSettlement={setEditingSettlement}
        onActivityChanged={refreshActivity}
      />
    </Page>
  )
}
