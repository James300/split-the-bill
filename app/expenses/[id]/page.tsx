import Page from '@/components/Page/Page';
import ExpenseContainer from '@/containers/Expense/Expense'
import ExpenseShareAction from '@/components/ExpenseShareAction/ExpenseShareAction'

export default async function ExpensePage({ params }: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Page
      title={<ExpenseContainer id={id} />}
      titleActions={<ExpenseShareAction expenseId={id} />}
    >
      {null}
    </Page>
  );
}
