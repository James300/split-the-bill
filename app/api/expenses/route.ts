import { mapExpenseInput, mapExpenseRecord } from '@/lib/mappers/expenseMapper.function'
import { createExpense } from '@/lib/services/expense.service'

export async function POST (request: Request) {
  const data = await request.json()

  const mappedExpenseData = mapExpenseInput(data)

  const expense = await createExpense(mappedExpenseData)
  const mappedExpense = mapExpenseRecord(expense)

  return new Response(JSON.stringify(mappedExpense))
}
