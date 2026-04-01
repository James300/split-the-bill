import { pool } from '@/lib/db'
import {
  PaymentAllocation,
  PaymentAllocationCreateInput,
  PaymentAllocationUpdateInput,
} from '@/lib/schemas/payment-allocation.schema'

export async function createPaymentAllocationInDatabase(
  input: PaymentAllocationCreateInput,
): Promise<PaymentAllocation> {
  const result = await pool.query<PaymentAllocation>(
    `
    INSERT INTO payment_allocations (payment_id, user_id, amount)
    VALUES ($1, $2, $3)
    RETURNING payment_id, user_id, amount;
    `,
    [input.payment_id, input.user_id, input.amount],
  )
  return result.rows[0]
}

export async function getPaymentAllocationsFromDatabaseByPaymentId(
  paymentId: number,
): Promise<PaymentAllocation[]> {
  const result = await pool.query<PaymentAllocation>(
    `
    SELECT payment_id, user_id, amount
    FROM payment_allocations
    WHERE payment_id = $1
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
    SELECT pa.payment_id, pa.user_id, pa.amount
    FROM payment_allocations pa
    JOIN payments p ON p.id = pa.payment_id
    WHERE p.expense_id = $1
    ORDER BY pa.payment_id, pa.user_id;
    `,
    [expenseId],
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

  const whereStart = i
  values.push(paymentId, userId)

  const result = await pool.query<PaymentAllocation>(
    `
    UPDATE payment_allocations
    SET ${fields.join(', ')}
    WHERE payment_id = $${whereStart} AND user_id = $${whereStart + 1}
    RETURNING payment_id, user_id, amount;
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
    SELECT payment_id, user_id, amount
    FROM payment_allocations
    WHERE payment_id = $1 AND user_id = $2;
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
    `DELETE FROM payment_allocations WHERE payment_id = $1 AND user_id = $2`,
    [paymentId, userId],
  )
  return (result.rowCount ?? 0) > 0
}
