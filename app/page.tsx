import Link from 'next/link'
import Page from '@/components/Page/Page'
import ExpensesList from '@/components/ExpensesList/ExpensesList'
import Button from '@/components/Button';

const mockData = {
  expenses: [
    {
      id: 1,
      name: 'Groceries',
      amountTotal: 100,
    },
    {
      id: 2,
      name: 'Rent',
      amountTotal: -500,
    },
    {
      id: 3,
      name: 'Utilities',
      amountTotal: 0,
    },
  ]
}

export default function Home() {
  return (
    <Page title='Expenses'>
      <ExpensesList {...mockData} />
      <div className='flex justify-center w-full mt-auto'>
        <Link href='/expenses/new'>
          <Button>Add New Expense</Button>
        </Link>
      </div>
    </Page>
  );
}
