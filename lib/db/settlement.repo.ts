import { pool } from '@/lib/db'
import {
  Settlement,
  SettlementCreateInput,
  SettlementUpdateInput,
} from '@/lib/schemas/settlement.schema'

export async function createSettlementInDatabase(
  input: SettlementCreateInput,
): Promise<Settlement> {
  const result = await pool.query<Settlement>(
    `
    INSERT INTO settlement (expense_id, payer_user_id, payee_user_id, amount, date)
    VALUES ($1, $2, $3, $4, COALESCE($5, NOW()::date))
    RETURNING id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at;
    `,
    [
      input.expense_id,
      input.payer_user_id,
      input.payee_user_id,
      input.amount,
      input.date ?? null,
    ],
  )
  return result.rows[0]
}

export async function getSettlementFromDatabaseById(
  id: number,
): Promise<Settlement | null> {
  const result = await pool.query<Settlement>(
    `
    SELECT id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at
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
    SELECT id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at
    FROM settlement
    WHERE expense_id = $1 AND deleted_at IS NULL
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
    SELECT id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at
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
  patch: SettlementUpdateInput,
): Promise<Settlement | null> {
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
    return getSettlementFromDatabaseById(id)
  }

  fields.push('updated_at = NOW()')
  values.push(id)

  const result = await pool.query<Settlement>(
    `
    UPDATE settlement
    SET ${fields.join(', ')}
    WHERE id = $${i}
    RETURNING id, expense_id, payer_user_id, payee_user_id, amount, date, created_at, updated_at, deleted_at;
    `,
    values,
  )

  return result.rows[0] ?? null
}

export async function deleteSettlementFromDatabase(id: number): Promise<boolean> {
  const result = await pool.query(
    `UPDATE settlement SET deleted_at = NOW() WHERE id = $1`,
    [id],
  )
  return (result.rowCount ?? 0) > 0
}
