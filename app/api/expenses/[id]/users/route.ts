import { parseJsonBody } from '@/lib/api/body'
import { json, jsonNoContent, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { addUserToExpense, getExpenseMembers } from '@/lib/services/expense.service'
import { ExpenseUserAddInput } from '@/lib/schemas/expense.schema'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const expenseId = requirePositiveIntParam(raw, 'expense id')
    return json(await getExpenseMembers(userId, expenseId), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  })
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const expenseId = requirePositiveIntParam(raw, 'expense id')
    const body = await parseJsonBody<ExpenseUserAddInput>(request)

    await addUserToExpense(userId, expenseId, body)
    return jsonNoContent()
  })
}
