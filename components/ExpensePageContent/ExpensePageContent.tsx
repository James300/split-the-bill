'use client'

import { useState } from 'react'
import ExpenseBalanceAction from '@/components/ExpenseBalanceAction/ExpenseBalanceAction'
import ExpenseMembersAction from '@/components/ExpenseMembersAction/ExpenseMembersAction'
import ExpensePaymentAction from '@/components/ExpensePaymentAction/ExpensePaymentAction'
import ExpenseShareAction from '@/components/ExpenseShareAction/ExpenseShareAction'
import Page from '@/components/Page/Page'
import ExpensePaymentList from '@/components/ExpensePaymentList/ExpensePaymentList'
import ExpenseContainer from '@/containers/Expense/Expense'

export default function ExpensePageContent({ expenseId }: { expenseId: string }) {
  const [paymentsRefreshKey, setPaymentsRefreshKey] = useState(0)

  return (
    <Page
      title={<ExpenseContainer id={expenseId} />}
      titleActions={(
        <>
          <ExpensePaymentAction
            expenseId={expenseId}
            onCreated={() => setPaymentsRefreshKey((current) => current + 1)}
          />
          <ExpenseBalanceAction
            expenseId={expenseId}
            onSettled={() => setPaymentsRefreshKey((current) => current + 1)}
          />
          <ExpenseMembersAction expenseId={expenseId} />
          <ExpenseShareAction expenseId={expenseId} />
        </>
      )}
    >
      <ExpensePaymentList expenseId={expenseId} refreshKey={paymentsRefreshKey} />
    </Page>
  )
}
