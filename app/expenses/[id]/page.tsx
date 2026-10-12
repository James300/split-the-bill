import ExpensePageContent from '@/components/ExpensePageContent/ExpensePageContent'

export default async function ExpensePage({ params }: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ExpensePageContent expenseId={id} />
}
