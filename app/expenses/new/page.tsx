import Page from '@/components/Page/Page'
import ExpenseForm from '@/containers/ExpenseForm/ExpenseForm'

export default async function ExpenseNewPage() {
  return (
    <Page>
      New Expense
      <ExpenseForm />
    </Page>
  )
}
