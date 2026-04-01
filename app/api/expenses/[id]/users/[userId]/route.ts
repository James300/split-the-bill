import { jsonNoContent, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { BadRequestError } from '@/lib/errors/domain'
import { removeUserFromExpense } from '@/lib/services/expense.service'

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; userId: string }> },
) {
  return runRoute(async () => {
    const requesterId = await getSessionUserId()
    const { id: raw, userId: targetUserId } = await context.params
    const expenseId = requirePositiveIntParam(raw, 'expense id')

    if (!targetUserId) {
      throw new BadRequestError('Invalid user id')
    }

    await removeUserFromExpense(requesterId, expenseId, targetUserId)
    return jsonNoContent()
  })
}
