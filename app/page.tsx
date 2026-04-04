import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'
import Page from '@/components/Page/Page'
import ExpensesList from '@/components/ExpensesList/ExpensesList'
import Button from '@/components/Button';
import type { IExpense } from '@/types/expense.interface';

async function getExpenses(): Promise<Record<number, IExpense>> {
  const cookieHeader = (await headers()).get('cookie')
  const response = await fetch('http://localhost:3000/api/expenses/delta?since=0', {
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch expenses. Please try again.')
  }

  return response.json() as Promise<Record<number, IExpense>>
}

export default async function Home() {
  const session = await auth.getSession()
  if (!session?.data?.user) {
    redirect('/auth/sign-in')
  }

  const expenses = await getExpenses()
  if (!expenses) {
    return null
  }

  const expensesArray = Object.values(expenses)

  return (
    <Page title='Expenses'>
      <ExpensesList expenses={expensesArray} />
      <div className='flex justify-center w-full mt-auto'>
        <Link href='/expenses/new'>
          <Button>Add New Expense</Button>
        </Link>
      </div>
    </Page>
  );
}
