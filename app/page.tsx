import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'
import Page from '@/components/Page/Page'
import ExpensesList from '@/components/ExpensesList/ExpensesList'
import Button from '@/components/Button';
import { headers } from 'next/headers'

async function getExpenses() {
  const cookieHeader = (await headers()).get('cookie')
  const response = await fetch('http://localhost:3000/api/expenses', {
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch expenses. Please try again.')
  }

  return response.json()
}

export default async function Home() {
  const session = await auth.getSession()
  if (!session?.data?.user) {
    redirect('/auth/sign-in')
  }

  const expenses = await getExpenses()

  return (
    <Page title='Expenses'>
      <ExpensesList expenses={expenses} />
      <div className='flex justify-center w-full mt-auto'>
        <Link href='/expenses/new'>
          <Button>Add New Expense</Button>
        </Link>
      </div>
    </Page>
  );
}
