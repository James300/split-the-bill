'use client'

import { useState } from 'react'
import ExpenseBalanceAction from '@/components/ExpenseBalanceAction/ExpenseBalanceAction'
import ExpenseMembersAction from '@/components/ExpenseMembersAction/ExpenseMembersAction'
import ExpensePaymentAction from '@/components/ExpensePaymentAction/ExpensePaymentAction'
import ExpenseShareAction from '@/components/ExpenseShareAction/ExpenseShareAction'
import Page from '@/components/Page/Page'
import ExpensePaymentList from '@/components/ExpensePaymentList/ExpensePaymentList'
import ExpenseContainer from '@/containers/Expense/Expense'
import { useRefreshWhenActive } from '@/hooks/useRefreshWhenActive/useRefreshWhenActive'
import type { ExpensePaymentRecord, PaymentAllocationRecord } from '@/hooks/useExpensePayments/useExpensePayments'
import type { ExpenseSettlementRecord } from '@/hooks/useExpenseSettlements/useExpenseSettlements'

export default function ExpensePageContent({ expenseId }: { expenseId: string }) {
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
            onCreated={refreshActivity}
            editingPayment={editingPayment?.payment}
            editingAllocations={editingPayment?.allocations}
            onEditComplete={() => setEditingPayment(null)}
            pageRefreshKey={pageRefreshKey}
          />
          <ExpenseBalanceAction
            expenseId={expenseId}
            onSettled={refreshActivity}
            editingSettlement={editingSettlement ?? undefined}
            onEditComplete={() => setEditingSettlement(null)}
            refreshKey={paymentsRefreshKey}
            pageRefreshKey={pageRefreshKey}
          />
          <ExpenseMembersAction expenseId={expenseId} pageRefreshKey={pageRefreshKey} />
          <ExpenseShareAction expenseId={expenseId} />
        </>
      )}
    >
      <ExpensePaymentList
        expenseId={expenseId}
        refreshKey={paymentsRefreshKey}
        pageRefreshKey={pageRefreshKey}
        onEditPayment={(payment, allocations) => setEditingPayment({ payment, allocations })}
        onEditSettlement={setEditingSettlement}
        onActivityChanged={refreshActivity}
      />
    </Page>
  )
}
