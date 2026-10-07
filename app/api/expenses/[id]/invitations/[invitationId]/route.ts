import { jsonNoContent, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { revokeExpenseInvitation } from '@/lib/services/expense-invitation.service'

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; invitationId: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: rawExpenseId, invitationId: rawInvitationId } = await context.params
    const expenseId = requirePositiveIntParam(rawExpenseId, 'expense id')
    const invitationId = requirePositiveIntParam(rawInvitationId, 'invitation id')

    await revokeExpenseInvitation(userId, expenseId, invitationId)
    return jsonNoContent()
  })
}
