import Page from '@/components/Page/Page';
import ExpenseContainer from '@/containers/Expense/Expense'

export default async function ExpensePage({ params }: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Page>
      <ExpenseContainer id={id} />
    </Page>
  );
}
