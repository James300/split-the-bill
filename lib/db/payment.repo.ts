import { pool } from '@/lib/db'
import { BadRequestError, NotFoundError } from '@/lib/errors/domain'
import type { PoolClient } from '@neondatabase/serverless'
import {
  Payment,
  PaymentUpdateInput,
} from '@/lib/schemas/payment.schema'

type PaymentQueryClient = Pick<PoolClient, 'query'>

export async function hasPaymentDescriptionColumn(client: PaymentQueryClient): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'payments'
        AND column_name = 'description'
    ) AS exists`,
  )
  return Boolean(result.rows[0]?.exists)
}

export async function getPaymentFromDatabaseById(
  id: number,
): Promise<Payment | null> {
  const descriptionColumn = await hasPaymentDescriptionColumn(pool)
    ? 'description'
    : 'NULL::text AS description'
  const result = await pool.query<Payment>(
    `
    SELECT id, expense_id, paid_by_user_id, amount, ${descriptionColumn}, created_at, updated_at, deleted_at, created_by_user_id
    FROM payments
    WHERE id = $1 AND deleted_at IS NULL;
    `,
    [id],
  )
  return result.rows[0] ?? null
}

export async function getPaymentsFromDatabaseByExpenseId(
  expenseId: number,
): Promise<Payment[]> {
  const descriptionColumn = await hasPaymentDescriptionColumn(pool)
    ? 'description'
    : 'NULL::text AS description'
  const result = await pool.query<Payment>(
    `
    SELECT id, expense_id, paid_by_user_id, amount, ${descriptionColumn}, created_at, updated_at, deleted_at, created_by_user_id
    FROM payments
    WHERE expense_id = $1
    ORDER BY id;
    `,
    [expenseId],
  )
  return result.rows
}

export async function getPaymentsFromDatabaseByExpenseIdSince(
  expenseId: number,
  since: number,
): Promise<Payment[]> {
  const sinceDate = new Date(since)
  const descriptionColumn = await hasPaymentDescriptionColumn(pool)
    ? 'description'
    : 'NULL::text AS description'
  const result = await pool.query<Payment>(
    `
    SELECT id, expense_id, paid_by_user_id, amount, ${descriptionColumn}, created_at, updated_at, deleted_at, created_by_user_id
    FROM payments
    WHERE expense_id = $1 AND updated_at > $2
    ORDER BY updated_at DESC;
    `,
    [expenseId, sinceDate],
  )
  return result.rows
}

export async function updatePaymentInDatabase(
  id: number,
  actorUserId: string,
  patch: PaymentUpdateInput,
): Promise<Payment | null> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const existing = await client.query<Payment>(
      `SELECT id, expense_id, paid_by_user_id, amount, description, created_at, updated_at, deleted_at, created_by_user_id
       FROM payments WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    )
    if (!existing.rows[0]) {
      await client.query('COMMIT')
      return null
    }
    const payment = existing.rows[0]
    const expense = await client.query(
      `SELECT id FROM expense WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
      [payment.expense_id],
    )
    if (expense.rowCount === 0) throw new NotFoundError()

    const locked = await client.query<Payment>(
      `SELECT id, expense_id, paid_by_user_id, amount, description, created_at, updated_at, deleted_at, created_by_user_id
       FROM payments p
       WHERE p.id = $1 AND p.deleted_at IS NULL
         AND p.created_by_user_id = $2
         AND EXISTS (
           SELECT 1 FROM user_expense ue
           WHERE ue.expense_id = p.expense_id AND ue.user_id::text = $2
         )
       FOR UPDATE`,
      [id, actorUserId],
    )
    const current = locked.rows[0]
    if (!current) throw new NotFoundError()

    const oldAllocations = await client.query(
      `SELECT id, payment_id, user_id, amount, created_at, updated_at, deleted_at
       FROM payment_allocations
       WHERE payment_id = $1 AND deleted_at IS NULL
       ORDER BY user_id
       FOR UPDATE`,
      [id],
    )
    await client.query(
      `INSERT INTO ledger_item_history (item_type, item_id, action, changed_by_user_id, previous_state)
       VALUES ('payment', $1, 'updated', $2, $3::jsonb)`,
      [id, actorUserId, JSON.stringify({ ...current, allocations: oldAllocations.rows })],
    )

    const memberIds = [...new Set([patch.paid_by_user_id, ...patch.participant_user_ids])]
    const memberResult = await client.query<{ id: string }>(
      `SELECT user_id::text AS id
       FROM user_expense
       WHERE expense_id = $1 AND user_id::text = ANY($2::text[])`,
      [current.expense_id, memberIds],
    )
    const members = new Set(memberResult.rows.map((row) => row.id))
    if (memberIds.some((memberId) => !members.has(memberId))) {
      throw new BadRequestError('The payer and everyone sharing this payment must belong to this expense.')
    }

    const updated = await client.query<Payment>(
      `UPDATE payments
       SET paid_by_user_id = $2, amount = $3, description = $4, updated_at = NOW()
       WHERE id = $1
       RETURNING id, expense_id, paid_by_user_id, amount, description, created_at, updated_at, deleted_at, created_by_user_id`,
      [id, patch.paid_by_user_id, patch.amount, patch.description],
    )
    await client.query(
      `UPDATE payment_allocations SET deleted_at = NOW(), updated_at = NOW()
       WHERE payment_id = $1 AND deleted_at IS NULL`,
      [id],
    )

    const orderedParticipants = [...patch.participant_user_ids].sort((left, right) =>
      left < right ? -1 : left > right ? 1 : 0,
    )
    const baseShare = Math.floor(patch.amount / orderedParticipants.length)
    const remainder = patch.amount % orderedParticipants.length
    for (const [index, userId] of orderedParticipants.entries()) {
      await client.query(
        `INSERT INTO payment_allocations (payment_id, user_id, amount)
         VALUES ($1, $2, $3)`,
        [id, userId, baseShare + (index < remainder ? 1 : 0)],
      )
    }

    await client.query('COMMIT')
    return updated.rows[0] ?? null
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function deletePaymentFromDatabase(id: number, actorUserId: string): Promise<boolean> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const existing = await client.query<Payment>(
      `SELECT id, expense_id, paid_by_user_id, amount, description, created_at, updated_at, deleted_at, created_by_user_id
       FROM payments WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    )
    const payment = existing.rows[0]
    if (!payment) {
      await client.query('COMMIT')
      return false
    }
    const expense = await client.query(
      `SELECT id FROM expense WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
      [payment.expense_id],
    )
    if (expense.rowCount === 0) throw new NotFoundError()

    const locked = await client.query<Payment>(
      `SELECT id, expense_id, paid_by_user_id, amount, description, created_at, updated_at, deleted_at, created_by_user_id
       FROM payments p
       WHERE p.id = $1 AND p.deleted_at IS NULL
         AND p.created_by_user_id = $2
         AND EXISTS (
           SELECT 1 FROM user_expense ue
           WHERE ue.expense_id = p.expense_id AND ue.user_id::text = $2
         )
       FOR UPDATE`,
      [id, actorUserId],
    )
    const current = locked.rows[0]
    if (!current) throw new NotFoundError()

    const allocations = await client.query(
      `SELECT id, payment_id, user_id, amount, created_at, updated_at, deleted_at
       FROM payment_allocations WHERE payment_id = $1 AND deleted_at IS NULL ORDER BY user_id`,
      [id],
    )
    await client.query(
      `INSERT INTO ledger_item_history (item_type, item_id, action, changed_by_user_id, previous_state)
       VALUES ('payment', $1, 'deleted', $2, $3::jsonb)`,
      [id, actorUserId, JSON.stringify({ ...current, allocations: allocations.rows })],
    )
    const result = await client.query(
      `UPDATE payments SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    )
    await client.query('COMMIT')
    return (result.rowCount ?? 0) > 0
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
