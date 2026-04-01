import { parseJsonBody } from '@/lib/api/body'
import { json, jsonNoContent, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { mapExpenseRecord } from '@/lib/mappers/expenseMapper.function'
import {
  deleteExpense,
  getExpenseById,
  updateExpense,
} from '@/lib/services/expense.service'
import { ExpenseUpdateInput } from '@/lib/schemas/expense.schema'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'expense id')

    const expense = await getExpenseById(userId, id)
    return json(mapExpenseRecord(expense))
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'expense id')
    const body = await parseJsonBody<ExpenseUpdateInput>(request)

    const expense = await updateExpense(userId, id, body)
    return json(mapExpenseRecord(expense))
  })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'expense id')

    await deleteExpense(userId, id)
    return jsonNoContent()
  })
}
