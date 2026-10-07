import Page from '@/components/Page/Page';
import ExpenseContainer from '@/containers/Expense/Expense'
import ExpenseShareAction from '@/components/ExpenseShareAction/ExpenseShareAction'
import ExpenseMembersAction from '@/components/ExpenseMembersAction/ExpenseMembersAction'
import ExpensePaymentAction from '@/components/ExpensePaymentAction/ExpensePaymentAction'

export default async function ExpensePage({ params }: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Page
      title={<ExpenseContainer id={id} />}
      titleActions={<><ExpensePaymentAction expenseId={id} /><ExpenseMembersAction expenseId={id} /><ExpenseShareAction expenseId={id} /></>}
    >
      {null}
    </Page>
  );
}
