import { pool } from '@/lib/db'
import { NotFoundError } from '@/lib/errors/domain'
import type { PoolClient } from '@neondatabase/serverless'

type ReadStateQueryClient = Pick<PoolClient, 'query'>

interface ExpenseUserReadState {
  last_read_at: Date
}

export async function initializeExpenseUserReadState(
  client: ReadStateQueryClient,
  userId: string,
  expenseId: number,
): Promise<void> {
  const result = await client.query(
    `INSERT INTO expense_user_read_state (expense_id, user_id, last_read_at)
     SELECT ue.expense_id, ue.user_id, NOW()
     FROM user_expense ue
     WHERE ue.user_id = $1 AND ue.expense_id = $2
     ON CONFLICT (expense_id, user_id) DO NOTHING`,
    [userId, expenseId],
  )

  if (result.rowCount === 0) {
    const membership = await client.query(
      `SELECT 1 FROM user_expense WHERE user_id = $1 AND expense_id = $2`,
      [userId, expenseId],
    )
    if (membership.rowCount === 0) {
      throw new NotFoundError()
    }
  }
}

export async function getExpenseUserReadStateFromDatabase(
  userId: string,
  expenseId: number,
): Promise<ExpenseUserReadState> {
  await initializeExpenseUserReadState(pool, userId, expenseId)
  const result = await pool.query<ExpenseUserReadState>(
    `SELECT last_read_at
     FROM expense_user_read_state
     WHERE user_id = $1 AND expense_id = $2`,
    [userId, expenseId],
  )
  const state = result.rows[0]
  if (!state) {
    throw new NotFoundError()
  }
  return state
}

export async function markExpenseUserReadThroughPaymentInDatabase(
  userId: string,
  expenseId: number,
  paymentId: number,
): Promise<ExpenseUserReadState> {
  const result = await pool.query<ExpenseUserReadState>(
    `UPDATE expense_user_read_state state
     SET last_read_at = GREATEST(state.last_read_at, payment.created_at),
         updated_at = NOW()
     FROM payments payment
     JOIN user_expense membership
       ON membership.expense_id = payment.expense_id
     WHERE state.user_id = $1
       AND state.expense_id = $2
       AND membership.user_id = $1
       AND payment.expense_id = $2
       AND payment.id = $3
       AND payment.deleted_at IS NULL
     RETURNING state.last_read_at`,
    [userId, expenseId, paymentId],
  )
  const state = result.rows[0]
  if (!state) {
    throw new NotFoundError()
  }
  return state
}
