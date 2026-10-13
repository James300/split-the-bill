import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { getSessionUserId } from '@/lib/api/session'
import {
  mapExpenseInput,
  mapExpenseRecord,
} from '@/lib/mappers/expenseMapper.function'
import { createExpense, getExpensesByUserId } from '@/lib/services/expense.service'
import { entityArrayToMap } from '@/lib/utils/entityArrayToMap'
import type { ICreateExpense } from '@/types/expense.interface'

export async function POST(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const data = await parseJsonBody<ICreateExpense>(request)
    const expense = await createExpense(userId, mapExpenseInput(data))
    return json(mapExpenseRecord(expense), { status: 201 })
  })
}

export async function GET(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const includeArchived = new URL(request.url).searchParams.get('includeArchived') === 'true'
    const expenses = await getExpensesByUserId(userId, includeArchived)
    return json(entityArrayToMap(expenses.map(mapExpenseRecord)))
  })
}
