import { pool } from '@/lib/db'
import { BadRequestError, NotFoundError } from '@/lib/errors/domain'
import type { PoolClient } from '@neondatabase/serverless'
import {
  Settlement,
  SettlementCreateInput,
  SettlementUpdateInput,
} from '@/lib/schemas/settlement.schema'

async function assertSettlementAllowed(
  client: PoolClient,
  expenseId: number,
  payerUserId: string,
  payeeUserId: string,
  amount: number,
  excludedSettlementId?: number,
) {
  if (payerUserId === payeeUserId) {
    throw new BadRequestError('The payer and payee must be different members.')
  }

  const memberRows = await client.query<{ user_id: string }>(
    `SELECT user_id::text
     FROM user_expense
     WHERE expense_id = $1 AND user_id::text = ANY($2::text[])`,
    [expenseId, [payerUserId, payeeUserId]],
  )
  if (memberRows.rowCount !== 2) {
    throw new BadRequestError('The payer and payee must both be members of this expense.')
  }

  const balances = await client.query<{ payer_net: string; payee_net: string }>(
    `WITH ledger_entries AS (
       SELECT paid_by_user_id::text AS user_id, amount::bigint AS amount_net
       FROM payments
       WHERE expense_id = $1 AND deleted_at IS NULL
       UNION ALL
       SELECT allocation.user_id::text, -allocation.amount::bigint
       FROM payment_allocations allocation
       JOIN payments payment ON payment.id = allocation.payment_id
       WHERE payment.expense_id = $1
         AND payment.deleted_at IS NULL
         AND allocation.deleted_at IS NULL
       UNION ALL
       SELECT payer_user_id::text, amount::bigint
       FROM settlement
       WHERE expense_id = $1
         AND deleted_at IS NULL
         AND ($4::integer IS NULL OR id <> $4)
       UNION ALL
       SELECT payee_user_id::text, -amount::bigint
       FROM settlement
       WHERE expense_id = $1
         AND deleted_at IS NULL
         AND ($4::integer IS NULL OR id <> $4)
     ),
     user_balances AS (
       SELECT user_id, SUM(amount_net) AS amount_net
       FROM ledger_entries
       GROUP BY user_id
     )
     SELECT
       COALESCE(MAX(amount_net) FILTER (WHERE user_id = $2), 0)::text AS payer_net,
       COALESCE(MAX(amount_net) FILTER (WHERE user_id = $3), 0)::text AS payee_net
     FROM user_balances`,
    [expenseId, payerUserId, payeeUserId, excludedSettlementId ?? null],
  )
  const payerNet = Number(balances.rows[0].payer_net)
  const payeeNet = Number(balances.rows[0].payee_net)
  if (!Number.isSafeInteger(payerNet) || !Number.isSafeInteger(payeeNet)) {
    throw new BadRequestError('The expense balance exceeds the supported amount range.')
  }
  const availableAmount = payerNet < 0 && payeeNet > 0
    ? Math.min(Math.abs(payerNet), payeeNet)
    : 0

  if (availableAmount === 0) {
    throw new BadRequestError('There is no outstanding balance in this direction.')
  }
  if (amount > availableAmount) {
    throw new BadRequestError('The settlement amount exceeds the outstanding balance in this direction.')
  }
}

export async function createSettlementInDatabase(
  actorUserId: string,
  input: SettlementCreateInput,
): Promise<Settlement> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const expense = await client.query(
      `SELECT id FROM expense WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
      [input.expense_id],
    )
    if (expense.rowCount === 0) {
      throw new NotFoundError()
    }
    const actorMembership = await client.query(
      `SELECT 1 FROM user_expense WHERE expense_id = $1 AND user_id::text = $2`,
      [input.expense_id, actorUserId],
    )
    if (actorMembership.rowCount === 0) throw new NotFoundError()

    await assertSettlementAllowed(
      client,
      input.expense_id,
      input.payer_user_id,
      input.payee_user_id,
      input.amount,
    )

    const result = await client.query<Settlement>(
      `INSERT INTO settlement (expense_id, payer_user_id, payee_user_id, amount, date, created_by_user_id)
       VALUES ($1, $2, $3, $4, COALESCE($5, NOW()::date), $6)
       RETURNING id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at, created_by_user_id`,
      [
        input.expense_id,
        input.payer_user_id,
        input.payee_user_id,
        input.amount,
        input.date ?? null,
        actorUserId,
      ],
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

export async function getSettlementFromDatabaseById(
  id: number,
): Promise<Settlement | null> {
  const result = await pool.query<Settlement>(
    `
    SELECT id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at, created_by_user_id
    FROM settlement
    WHERE id = $1 AND deleted_at IS NULL;
    `,
    [id],
  )
  return result.rows[0] ?? null
}

export async function getSettlementsFromDatabaseByExpenseId(
  expenseId: number,
): Promise<Settlement[]> {
  const result = await pool.query<Settlement>(
    `
    SELECT id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at, created_by_user_id
    FROM settlement
    WHERE expense_id = $1
    ORDER BY date DESC, id;
    `,
    [expenseId],
  )
  return result.rows
}

export async function getSettlementsFromDatabaseByExpenseIdSince(
  expenseId: number,
  since: number,
): Promise<Settlement[]> {
  const sinceDate = new Date(since)
  const result = await pool.query<Settlement>(
    `
    SELECT id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at, created_by_user_id
    FROM settlement
    WHERE expense_id = $1 AND updated_at > $2
    ORDER BY updated_at DESC;
    `,
    [expenseId, sinceDate],
  )
  return result.rows
}

export async function updateSettlementInDatabase(
  id: number,
  actorUserId: string,
  patch: SettlementUpdateInput,
): Promise<Settlement | null> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const existingExpense = await client.query<{ expense_id: number }>(
      `SELECT expense_id FROM settlement WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    )
    if (existingExpense.rowCount === 0) {
      await client.query('COMMIT')
      return null
    }

    const expenseId = existingExpense.rows[0].expense_id
    const expense = await client.query(
      `SELECT id FROM expense WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
      [expenseId],
    )
    if (expense.rowCount === 0) {
      throw new NotFoundError()
    }
    const existingResult = await client.query<Settlement>(
      `SELECT id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at, created_by_user_id
       FROM settlement s
       WHERE s.id = $1 AND s.deleted_at IS NULL
         AND s.created_by_user_id = $2
         AND EXISTS (
           SELECT 1 FROM user_expense ue
           WHERE ue.expense_id = s.expense_id AND ue.user_id::text = $2
         )
       FOR UPDATE`,
      [id, actorUserId],
    )
    const existing = existingResult.rows[0]
    if (!existing) {
      throw new NotFoundError()
    }

    const payerUserId = patch.payer_user_id ?? existing.payer_user_id
    const payeeUserId = patch.payee_user_id ?? existing.payee_user_id
    const amount = patch.amount ?? existing.amount
    if (
      patch.payer_user_id !== undefined
      || patch.payee_user_id !== undefined
      || patch.amount !== undefined
    ) {
      await assertSettlementAllowed(client, expenseId, payerUserId, payeeUserId, amount, id)
    }

    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (patch.payer_user_id !== undefined) {
      fields.push(`payer_user_id = $${i++}`)
      values.push(patch.payer_user_id)
    }
    if (patch.payee_user_id !== undefined) {
      fields.push(`payee_user_id = $${i++}`)
      values.push(patch.payee_user_id)
    }
    if (patch.amount !== undefined) {
      fields.push(`amount = $${i++}`)
      values.push(patch.amount)
    }
    if (patch.date !== undefined) {
      fields.push(`date = $${i++}`)
      values.push(patch.date)
    }

    if (fields.length === 0) {
      await client.query('COMMIT')
      return existing
    }

    await client.query(
      `INSERT INTO ledger_item_history (item_type, item_id, action, changed_by_user_id, previous_state)
       VALUES ('settlement', $1, 'updated', $2, $3::jsonb)`,
      [id, actorUserId, JSON.stringify(existing)],
    )
    fields.push('updated_at = NOW()')
    values.push(id)

    const result = await client.query<Settlement>(
      `
      UPDATE settlement
      SET ${fields.join(', ')}
      WHERE id = $${i}
      RETURNING id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at, created_by_user_id;
      `,
      values,
    )

    await client.query('COMMIT')
    return result.rows[0] ?? null
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function deleteSettlementFromDatabase(id: number, actorUserId: string): Promise<boolean> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const existingExpense = await client.query<{ expense_id: number }>(
      `SELECT expense_id FROM settlement WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    )
    if (existingExpense.rowCount === 0) {
      await client.query('COMMIT')
      return false
    }

    const expense = await client.query(
      `SELECT id FROM expense WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
      [existingExpense.rows[0].expense_id],
    )
    if (expense.rowCount === 0) throw new NotFoundError()

    const existing = await client.query<Settlement>(
      `SELECT id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at, created_by_user_id
       FROM settlement s
       WHERE s.id = $1 AND s.deleted_at IS NULL
         AND s.created_by_user_id = $2
         AND EXISTS (
           SELECT 1 FROM user_expense ue
           WHERE ue.expense_id = s.expense_id AND ue.user_id::text = $2
         )
       FOR UPDATE`,
      [id, actorUserId],
    )
    const current = existing.rows[0]
    if (!current) throw new NotFoundError()
    await client.query(
      `INSERT INTO ledger_item_history (item_type, item_id, action, changed_by_user_id, previous_state)
       VALUES ('settlement', $1, 'deleted', $2, $3::jsonb)`,
      [id, actorUserId, JSON.stringify(current)],
    )
    const result = await client.query(
      `UPDATE settlement SET deleted_at = NOW(), updated_at = NOW()
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
