import { pool } from '@/lib/db'
import { BadRequestError } from '@/lib/errors/domain'
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
    SELECT id, expense_id, paid_by_user_id, amount, ${descriptionColumn}, created_at, updated_at, deleted_at
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
    SELECT id, expense_id, paid_by_user_id, amount, ${descriptionColumn}, created_at, updated_at, deleted_at
    FROM payments
    WHERE expense_id = $1 AND deleted_at IS NULL
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
    SELECT id, expense_id, paid_by_user_id, amount, ${descriptionColumn}, created_at, updated_at, deleted_at
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
  patch: PaymentUpdateInput,
): Promise<Payment | null> {
  const hasDescriptionColumn = await hasPaymentDescriptionColumn(pool)
  if (patch.description !== undefined && !hasDescriptionColumn) {
    throw new BadRequestError('Apply the payment description database migration before editing item descriptions.')
  }
  const descriptionColumn = hasDescriptionColumn
    ? 'description'
    : 'NULL::text AS description'
  const fields: string[] = []
  const values: unknown[] = []
  let i = 1

  if (patch.paid_by_user_id !== undefined) {
    fields.push(`paid_by_user_id = $${i++}`)
    values.push(patch.paid_by_user_id)
  }
  if (patch.amount !== undefined) {
    fields.push(`amount = $${i++}`)
    values.push(patch.amount)
  }
  if (patch.description !== undefined) {
    fields.push(`description = $${i++}`)
    values.push(patch.description)
  }

  if (fields.length === 0) {
    return getPaymentFromDatabaseById(id)
  }

  fields.push(`updated_at = NOW()`)
  values.push(id)

  const result = await pool.query<Payment>(
    `
    UPDATE payments
    SET ${fields.join(', ')}
    WHERE id = $${i}
    RETURNING id, expense_id, paid_by_user_id, amount, ${descriptionColumn}, created_at, updated_at, deleted_at;
    `,
    values,
  )

  return result.rows[0] ?? null
}

export async function deletePaymentFromDatabase(id: number): Promise<boolean> {
  const result = await pool.query(
    `UPDATE payments SET deleted_at = NOW() WHERE id = $1`,
    [id],
  )
  return (result.rowCount ?? 0) > 0
}
