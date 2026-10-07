import { pool } from '@/lib/db'
import type { ExpenseInvitation, ExpenseInvitationPreview } from '@/lib/schemas/expense-invitation.schema'
import { NotFoundError } from '@/lib/errors/domain'

export interface ExpenseInvitationSummary {
  id: number
  created_at: Date
  expires_at: Date
}

export async function createExpenseInvitationInDatabase(
  requesterId: string,
  expenseId: number,
  tokenHash: string,
): Promise<ExpenseInvitation> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const expenseResult = await client.query(
      `SELECT e.id
       FROM expense e
       JOIN user_expense ue ON ue.expense_id = e.id
       WHERE e.id = $1 AND ue.user_id = $2 AND e.deleted_at IS NULL
       FOR UPDATE OF e`,
      [expenseId, requesterId],
    )

    if (expenseResult.rowCount === 0) {
      throw new NotFoundError()
    }

    await client.query(
      `UPDATE expense_invitation
       SET revoked_at = NOW()
       WHERE expense_id = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
      [expenseId],
    )

    const result = await client.query<ExpenseInvitation>(
      `INSERT INTO expense_invitation (expense_id, created_by_user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')
       RETURNING id, expense_id, created_by_user_id, created_at, expires_at, revoked_at`,
      [expenseId, requesterId, tokenHash],
    )

    await client.query('COMMIT')
    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function listActiveExpenseInvitationsInDatabase(
  expenseId: number,
): Promise<ExpenseInvitationSummary[]> {
  const result = await pool.query<ExpenseInvitationSummary>(
    `SELECT ei.id, ei.created_at, ei.expires_at
     FROM expense_invitation ei
     JOIN expense e ON e.id = ei.expense_id
     WHERE ei.expense_id = $1
       AND e.deleted_at IS NULL
       AND ei.revoked_at IS NULL
       AND ei.expires_at > NOW()
     ORDER BY ei.created_at DESC`,
    [expenseId],
  )
  return result.rows
}

export async function revokeExpenseInvitationInDatabase(
  expenseId: number,
  invitationId: number,
): Promise<void> {
  const result = await pool.query(
    `UPDATE expense_invitation
     SET revoked_at = NOW()
     WHERE expense_id = $1 AND id = $2 AND revoked_at IS NULL`,
    [expenseId, invitationId],
  )

  if (result.rowCount === 0) {
    throw new NotFoundError()
  }
}

export async function getExpenseInvitationPreviewFromDatabase(
  tokenHash: string,
): Promise<ExpenseInvitationPreview | null> {
  const invitationResult = await pool.query<{
    expense_id: number
    expense_name: string
    expires_at: Date
  }>(
    `SELECT e.id AS expense_id, e.name AS expense_name, ei.expires_at
     FROM expense_invitation ei
     JOIN expense e ON e.id = ei.expense_id
     WHERE ei.token_hash = $1
       AND ei.revoked_at IS NULL
       AND ei.expires_at > NOW()
       AND e.deleted_at IS NULL`,
    [tokenHash],
  )

  const invitation = invitationResult.rows[0]
  if (!invitation) {
    return null
  }

  const memberResult = await pool.query<{ id: string; name: string }>(
    `SELECT ue.user_id AS id, COALESCE(NULLIF(u.name, ''), 'Member') AS name
     FROM user_expense ue
     LEFT JOIN "user" u ON u.id = ue.user_id AND u.deleted_at IS NULL
     WHERE ue.expense_id = $1
     ORDER BY name, ue.user_id`,
    [invitation.expense_id],
  )

  return {
    ...invitation,
    members: memberResult.rows,
  }
}

export async function joinExpenseWithInvitationInDatabase(
  tokenHash: string,
  userId: string,
): Promise<number> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const invitationResult = await client.query<{ expense_id: number }>(
      `SELECT ei.expense_id
       FROM expense_invitation ei
       JOIN expense e ON e.id = ei.expense_id
       WHERE ei.token_hash = $1
         AND ei.revoked_at IS NULL
         AND ei.expires_at > NOW()
         AND e.deleted_at IS NULL
       FOR UPDATE OF ei`,
      [tokenHash],
    )

    const invitation = invitationResult.rows[0]
    if (!invitation) {
      throw new NotFoundError()
    }

    await client.query(
      `INSERT INTO user_expense (user_id, expense_id)
       SELECT $1, $2
       WHERE NOT EXISTS (
         SELECT 1 FROM user_expense WHERE user_id = $1 AND expense_id = $2
       )`,
      [userId, invitation.expense_id],
    )

    await client.query('COMMIT')
    return invitation.expense_id
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
