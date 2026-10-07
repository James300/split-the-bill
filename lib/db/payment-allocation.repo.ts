import { pool } from '@/lib/db'
import {
  PaymentAllocation,
  PaymentAllocationUpdateInput,
} from '@/lib/schemas/payment-allocation.schema'

export async function getPaymentAllocationsFromDatabaseByPaymentId(
  paymentId: number,
): Promise<PaymentAllocation[]> {
  const result = await pool.query<PaymentAllocation>(
    `
    SELECT payment_id, user_id, amount, created_at, updated_at, deleted_at
    FROM payment_allocations
    WHERE payment_id = $1 AND deleted_at IS NULL
    ORDER BY user_id;
    `,
    [paymentId],
  )
  return result.rows
}

export async function getPaymentAllocationsFromDatabaseByExpenseId(
  expenseId: number,
): Promise<PaymentAllocation[]> {
  const result = await pool.query<PaymentAllocation>(
    `
    SELECT pa.payment_id, pa.user_id, pa.amount, pa.created_at, pa.updated_at, pa.deleted_at
    FROM payment_allocations pa
    JOIN payments p ON p.id = pa.payment_id
    WHERE p.expense_id = $1 AND pa.deleted_at IS NULL
    ORDER BY pa.payment_id, pa.user_id;
    `,
    [expenseId],
  )
  return result.rows
}

export async function getPaymentAllocationsFromDatabaseByExpenseIdSince(
  expenseId: number,
  since: number,
): Promise<PaymentAllocation[]> {
  const sinceDate = new Date(since)
  const result = await pool.query<PaymentAllocation>(
    `
    SELECT pa.payment_id, pa.user_id, pa.amount, pa.created_at, pa.updated_at, pa.deleted_at
    FROM payment_allocations pa
    JOIN payments p ON p.id = pa.payment_id
    WHERE p.expense_id = $1 AND pa.updated_at > $2
    ORDER BY pa.updated_at DESC;
    `,
    [expenseId, sinceDate],
  )
  return result.rows
}

export async function updatePaymentAllocationInDatabase(
  paymentId: number,
  userId: string,
  patch: PaymentAllocationUpdateInput,
): Promise<PaymentAllocation | null> {
  const fields: string[] = []
  const values: unknown[] = []
  let i = 1

  if (patch.user_id !== undefined) {
    fields.push(`user_id = $${i++}`)
    values.push(patch.user_id)
  }
  if (patch.amount !== undefined) {
    fields.push(`amount = $${i++}`)
    values.push(patch.amount)
  }

  if (fields.length === 0) {
    return getPaymentAllocationFromDatabase(paymentId, userId)
  }

  fields.push(`updated_at = NOW()`)
  const whereStart = i
  values.push(paymentId, userId)

  const result = await pool.query<PaymentAllocation>(
    `
    UPDATE payment_allocations
    SET ${fields.join(', ')}
    WHERE payment_id = $${whereStart} AND user_id = $${whereStart + 1}
    RETURNING payment_id, user_id, amount, created_at, updated_at, deleted_at;
    `,
    values,
  )

  return result.rows[0] ?? null
}

export async function getPaymentAllocationFromDatabase(
  paymentId: number,
  userId: string,
): Promise<PaymentAllocation | null> {
  const result = await pool.query<PaymentAllocation>(
    `
    SELECT payment_id, user_id, amount, created_at, updated_at, deleted_at
    FROM payment_allocations
    WHERE payment_id = $1 AND user_id = $2 AND deleted_at IS NULL;
    `,
    [paymentId, userId],
  )
  return result.rows[0] ?? null
}

export async function deletePaymentAllocationFromDatabase(
  paymentId: number,
  userId: string,
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE payment_allocations SET deleted_at = NOW() WHERE payment_id = $1 AND user_id = $2`,
    [paymentId, userId],
  )
  return (result.rowCount ?? 0) > 0
}
