import { pool } from '@/lib/db'
import { NotFoundError } from '@/lib/errors/domain'
import type { PoolClient } from '@neondatabase/serverless'

type ReadStateQueryClient = Pick<PoolClient, 'query'>

interface ExpenseUserReadState {
  last_read_at: Date
  last_read_activity_date: string | null
  last_read_activity_id: number | null
  last_read_activity_type: 'payment' | 'settlement' | null
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
    `SELECT last_read_at, last_read_activity_date::text, last_read_activity_id, last_read_activity_type
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
       SELECT COALESCE(date, created_at::date)::text AS activity_date,
            created_at, id, 'payment'::text AS activity_type
       FROM payments
       WHERE $3 = 'payment'
       AND id = $4
       AND expense_id = $2
       UNION ALL
       SELECT COALESCE(date, created_at::date)::text AS activity_date,
            created_at, id, 'settlement'::text AS activity_type
       FROM settlement
       WHERE $3 = 'settlement'
       AND id = $4
       AND expense_id = $2
     ),
     updated_state AS (
       UPDATE expense_user_read_state state
       SET last_read_at = GREATEST(state.last_read_at, target_activity.created_at),
         last_read_activity_date = target_activity.activity_date::date,
         last_read_activity_id = target_activity.id,
         last_read_activity_type = target_activity.activity_type,
         updated_at = NOW()
       FROM target_activity
       WHERE state.user_id = $1
       AND state.expense_id = $2
       AND EXISTS (
         SELECT 1
         FROM user_expense membership
         WHERE membership.user_id = $1 AND membership.expense_id = $2
       )
       AND (
         state.last_read_activity_date IS NULL
         OR target_activity.activity_date > state.last_read_activity_date::text
         OR (
           target_activity.activity_date = state.last_read_activity_date::text
           AND target_activity.id > state.last_read_activity_id
         )
         OR (
           target_activity.activity_date = state.last_read_activity_date::text
           AND target_activity.id = state.last_read_activity_id
           AND target_activity.activity_type = 'settlement'
           AND state.last_read_activity_type = 'payment'
         )
       )
       RETURNING state.*
     )
     SELECT last_read_at, last_read_activity_date::text, last_read_activity_id, last_read_activity_type
     FROM updated_state
     UNION ALL
     SELECT state.last_read_at, state.last_read_activity_date::text,
          state.last_read_activity_id, state.last_read_activity_type
     FROM expense_user_read_state state
     WHERE state.user_id = $1
       AND state.expense_id = $2
       AND EXISTS (SELECT 1 FROM target_activity)
       AND NOT EXISTS (SELECT 1 FROM updated_state)`,
    [userId, expenseId, activityType, activityId],
  )
  const state = result.rows[0]
  if (!state) {
    throw new NotFoundError()
  }
  return state
}
