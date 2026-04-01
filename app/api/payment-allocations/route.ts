import { json, runRoute } from '@/lib/api/http'
import { requireExpenseIdQuery } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { listAllocationsForExpense } from '@/lib/services/payment.service'

export async function GET(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const expenseId = requireExpenseIdQuery(new URL(request.url))
    const allocations = await listAllocationsForExpense(userId, expenseId)
    return json(allocations)
  })
}
