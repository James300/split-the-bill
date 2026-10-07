import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'
import { getExpensesByUserId } from '@/lib/services/expense.service'
import { mapExpenseRecord } from '@/lib/mappers/expenseMapper.function'
import Page from '@/components/Page/Page'
import ExpensesList from '@/components/ExpensesList/ExpensesList'
import Button from '@/components/Button';
import type { IExpense } from '@/types/expense.interface';

async function getExpenses(userId: string): Promise<IExpense[]> {
  const expenses = await getExpensesByUserId(userId)
  return expenses.map(mapExpenseRecord)
}

export default async function Home() {
  const session = await auth.getSession()
  if (!session?.data?.user) {
    redirect('/auth/sign-in')
  }

  let expenses: IExpense[] = []
  let hasLoadError = false

  try {
    expenses = await getExpenses(session.data.user.id)
  } catch {
    hasLoadError = true
  }

  return (
    <Page title='Expenses'>
      {hasLoadError ? (
        <p role='alert' className='text-sm text-destructive'>
          We couldn&apos;t load your expenses. Refresh the page to try again.
        </p>
      ) : (
        <ExpensesList expenses={expenses} />
      )}
      <div className='flex justify-center w-full mt-auto'>
        <Link href='/expenses/new'>
          <Button>Add New Expense</Button>
        </Link>
      </div>
    </Page>
  );
}
