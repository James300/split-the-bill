import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { getSessionUserId } from '@/lib/api/session'
import {
  mapExpenseInput,
  mapExpenseRecord,
} from '@/lib/mappers/expenseMapper.function'
import { createExpense, getExpensesByUserId } from '@/lib/services/expense.service'
import type { ICreateExpense } from '@/types/expense.interface'

export async function POST(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const data = await parseJsonBody<ICreateExpense>(request)
    const expense = await createExpense(userId, mapExpenseInput(data))
    return json(mapExpenseRecord(expense), { status: 201 })
  })
}

export async function GET() {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const expenses = await getExpensesByUserId(userId)
    return json(expenses.map(mapExpenseRecord))
  })
}
