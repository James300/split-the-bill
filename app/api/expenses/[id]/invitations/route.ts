import { json, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { createExpenseInvitation, listExpenseInvitations } from '@/lib/services/expense-invitation.service'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const expenseId = requirePositiveIntParam(raw, 'expense id')
    const invitations = await listExpenseInvitations(userId, expenseId)
    return json(invitations.map((invitation) => ({
      id: invitation.id,
      createdAt: invitation.created_at,
      expiresAt: invitation.expires_at,
    })))
  })
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const expenseId = requirePositiveIntParam(raw, 'expense id')
    const invitation = await createExpenseInvitation(userId, expenseId)
    return json({
      id: invitation.id,
      token: invitation.token,
      createdAt: invitation.created_at,
      expiresAt: invitation.expires_at,
    }, { status: 201 })
  })
}
