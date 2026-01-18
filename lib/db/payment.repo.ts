import { PoolClient } from '@neondatabase/serverless'
import { pool } from '@/lib/db'
import { Payment, PaymentInput, PaymentUpdateInput } from '@/lib/schemas/payment.schema'
import { PaymentAllocationCreateInput } from '@/lib/schemas/payment-allocation.schema'

export async function createPaymentWithAllocations(input: PaymentInput) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const paymentResult = await client.query(
      `
      INSERT INTO payments (expense_id, paid_by_user_id, amount)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [input.expense_id, input.paid_by_user_id, input.amount]
    )

    const paymentId = paymentResult.rows[0].id

    insertAllocations(client, paymentId, input.allocations)

    await client.query('COMMIT')

    return paymentId
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function updatePaymentWithAllocations(input: PaymentUpdateInput) {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const paymentResult = await client.query<Payment>(
      `
      SELECT id, expense_id
      FROM payments
      WHERE id = $1
      FOR UPDATE
      `,
      [input.id]
    )

    if (paymentResult.rowCount === 0) {
      throw new Error("Payment not found")
    }

    await client.query(
      `
      UPDATE payments
      SET amount = $1, paid_by_user_id = $2
      WHERE id = $3
      `,
      [input.amount, input.paid_by_user_id, input.id]
    )

    await client.query(
      `
      DELETE FROM payment_allocations
      WHERE payment_id = $1
      `,
      [input.id]
    )

    insertAllocations(client, input.id, input.allocations)

    await client.query("COMMIT")

    return input
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

async function insertAllocations(client: PoolClient, paymentId: number, allocations: PaymentAllocationCreateInput[]) {
  for (const alloc of allocations) {
    await client.query(
      `
      INSERT INTO payment_allocations (
        payment_id,
        user_id,
        amount
      )
      VALUES ($1, $2, $3)
      `,
      [paymentId, alloc.user_id, alloc.amount]
    )
  }
}
