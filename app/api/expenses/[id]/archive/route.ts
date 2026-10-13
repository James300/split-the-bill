import { json, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { mapExpenseRecord } from '@/lib/mappers/expenseMapper.function'
import { archiveExpense } from '@/lib/services/expense.service'

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'expense id')
    const expense = await archiveExpense(userId, id)
    return json(mapExpenseRecord(expense))
  })
}
