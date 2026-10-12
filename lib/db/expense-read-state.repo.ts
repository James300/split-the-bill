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

export async function markExpenseUserReadThroughActivityInDatabase(
  userId: string,
  expenseId: number,
  activityType: 'payment' | 'settlement',
  activityId: number,
): Promise<ExpenseUserReadState> {
  const result = await pool.query<ExpenseUserReadState>(
    `WITH target_activity AS (
       SELECT created_at
       FROM payments
       WHERE $3 = 'payment'
         AND id = $4
         AND expense_id = $2
         AND deleted_at IS NULL
       UNION ALL
       SELECT created_at
       FROM settlement
       WHERE $3 = 'settlement'
         AND id = $4
         AND expense_id = $2
         AND deleted_at IS NULL
     )
     UPDATE expense_user_read_state state
     SET last_read_at = GREATEST(state.last_read_at, target_activity.created_at),
         updated_at = NOW()
     FROM target_activity
     WHERE state.user_id = $1
       AND state.expense_id = $2
       AND EXISTS (
         SELECT 1
         FROM user_expense membership
         WHERE membership.user_id = $1 AND membership.expense_id = $2
       )
     RETURNING state.last_read_at`,
    [userId, expenseId, activityType, activityId],
  )
  const state = result.rows[0]
  if (!state) {
    throw new NotFoundError()
  }
  return state
}
