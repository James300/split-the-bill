import { pool } from '@/lib/db'
import {
  Payment,
  PaymentCreateInput,
  PaymentUpdateInput,
} from '@/lib/schemas/payment.schema'

export async function createPaymentInDatabase(
  input: PaymentCreateInput,
): Promise<Payment> {
  const result = await pool.query<Payment>(
    `
    INSERT INTO payments (expense_id, paid_by_user_id, amount)
    VALUES ($1, $2, $3)
    RETURNING id, expense_id, paid_by_user_id, amount;
    `,
    [input.expense_id, input.paid_by_user_id, input.amount],
  )
  return result.rows[0]
}

export async function getPaymentFromDatabaseById(
  id: number,
): Promise<Payment | null> {
  const result = await pool.query<Payment>(
    `
    SELECT id, expense_id, paid_by_user_id, amount
    FROM payments
    WHERE id = $1;
    `,
    [id],
  )
  return result.rows[0] ?? null
}

export async function getPaymentsFromDatabaseByExpenseId(
  expenseId: number,
): Promise<Payment[]> {
  const result = await pool.query<Payment>(
    `
    SELECT id, expense_id, paid_by_user_id, amount
    FROM payments
    WHERE expense_id = $1
    ORDER BY id;
    `,
    [expenseId],
  )
  return result.rows
}

export async function updatePaymentInDatabase(
  id: number,
  patch: PaymentUpdateInput,
): Promise<Payment | null> {
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

  if (fields.length === 0) {
    return getPaymentFromDatabaseById(id)
  }

  values.push(id)

  const result = await pool.query<Payment>(
    `
    UPDATE payments
    SET ${fields.join(', ')}
    WHERE id = $${i}
    RETURNING id, expense_id, paid_by_user_id, amount;
    `,
    values,
  )

  return result.rows[0] ?? null
}

export async function deletePaymentFromDatabase(id: number): Promise<boolean> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`DELETE FROM payment_allocations WHERE payment_id = $1`, [id])
    const result = await client.query(`DELETE FROM payments WHERE id = $1`, [id])
    await client.query('COMMIT')
    return (result.rowCount ?? 0) > 0
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
