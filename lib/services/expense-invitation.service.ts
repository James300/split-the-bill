import { requireExpenseMember } from '@/lib/access/expense-member'
import {
  createExpenseInvitationInDatabase,
  getExpenseInvitationPreviewFromDatabase,
  joinExpenseWithInvitationInDatabase,
  listActiveExpenseInvitationsInDatabase,
  revokeExpenseInvitationInDatabase,
} from '@/lib/db/expense-invitation.repo'
import { createExpenseInvitationToken, hashExpenseInvitationToken } from '@/lib/utils/expense-invitation-token'
import { NotFoundError } from '@/lib/errors/domain'

export async function createExpenseInvitation(userId: string, expenseId: number) {
  await requireExpenseMember(userId, expenseId)

  const token = createExpenseInvitationToken()
  const tokenHash = hashExpenseInvitationToken(token)
  if (!tokenHash) {
    throw new Error('Unable to generate an expense invitation token')
  }

  const invitation = await createExpenseInvitationInDatabase(userId, expenseId, tokenHash)
  return {
    id: invitation.id,
    token,
    created_at: invitation.created_at,
    expires_at: invitation.expires_at,
  }
}

export async function listExpenseInvitations(userId: string, expenseId: number) {
  await requireExpenseMember(userId, expenseId)
  return listActiveExpenseInvitationsInDatabase(expenseId)
}

export async function revokeExpenseInvitation(
  userId: string,
  expenseId: number,
  invitationId: number,
): Promise<void> {
  await requireExpenseMember(userId, expenseId)
  await revokeExpenseInvitationInDatabase(expenseId, invitationId)
}

export async function getExpenseInvitationPreview(token: string) {
  const tokenHash = hashExpenseInvitationToken(token)
  if (!tokenHash) {
    return null
  }
  return getExpenseInvitationPreviewFromDatabase(tokenHash)
}

export async function joinExpenseWithInvitation(token: string, userId: string) {
  const tokenHash = hashExpenseInvitationToken(token)
  if (!tokenHash) {
    throw new NotFoundError()
  }
  const expenseId = await joinExpenseWithInvitationInDatabase(tokenHash, userId)
  return { expense_id: expenseId }
}
