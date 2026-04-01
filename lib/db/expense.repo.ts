import { pool } from '@/lib/db'
import { NotFoundError } from '@/lib/errors/domain'
import { Expense, ExpenseCreateInput, ExpenseUpdateInput } from '@/lib/schemas/expense.schema'
import { PoolClient } from '@neondatabase/serverless'

export async function userHasExpenseAccess(
  userId: string,
  expenseId: number,
): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM user_expense WHERE user_id = $1 AND expense_id = $2
    ) AS exists`,
    [userId, expenseId],
  )
  return Boolean(result.rows[0]?.exists)
}

export async function createExpenseInDatabase(
  userId: string,
  expense: ExpenseCreateInput,
): Promise<Expense> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const expenseResult = await client.query<{ id: number }>(
      `
      INSERT INTO expense (name, currency, description)
      VALUES ($1, $2, $3)
      RETURNING id;
      `,
      [expense.name, expense.currency, expense.description ?? null],
    )

    const expenseRow = expenseResult.rows[0]

    await createUserExpense(client, userId, expenseRow.id)

    await client.query('COMMIT')

    return getExpenseRowById(client, expenseRow.id)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function createUserExpense(
  client: PoolClient,
  userId: string,
  expenseId: number,
) {
  await client.query(
    `
    INSERT INTO user_expense (user_id, expense_id)
    VALUES ($1, $2);
    `,
    [userId, expenseId],
  )
}

async function getExpenseRowById(
  client: Pick<PoolClient, 'query'>,
  expenseId: number,
): Promise<Expense> {
  const result = await client.query<Expense>(
    `
    SELECT
      e.id,
      e.name,
      e.description,
      e.currency,
      e.created_at,
      e.updated_at,
      COALESCE(
        (SELECT array_agg(ue2.user_id ORDER BY ue2.user_id)
         FROM user_expense ue2
         WHERE ue2.expense_id = e.id),
        '{}'
      ) AS user_ids
    FROM expense e
    WHERE e.id = $1
    `,
    [expenseId],
  )

  const row = result.rows[0]
  if (!row) {
    throw new NotFoundError()
  }
  return row
}

export async function getExpenseFromDatabaseById(
  userId: string,
  expenseId: number,
): Promise<Expense> {
  const client = await pool.connect()

  try {
    const result = await client.query<Expense>(
      `
      SELECT
        e.id,
        e.name,
        e.description,
        e.currency,
        e.created_at,
        e.updated_at,
        COALESCE(
          (SELECT array_agg(ue2.user_id ORDER BY ue2.user_id)
           FROM user_expense ue2
           WHERE ue2.expense_id = e.id),
          '{}'
        ) AS user_ids
      FROM expense e
      JOIN user_expense ue ON e.id = ue.expense_id
      WHERE ue.user_id = $1 AND e.id = $2
      `,
      [userId, expenseId],
    )

    const row = result.rows[0]
    if (!row) {
      throw new NotFoundError()
    }
    return row
  } finally {
    client.release()
  }
}

export async function getExpensesFromDatabaseByUserId(
  userId: string,
): Promise<Expense[]> {
  const client = await pool.connect()

  try {
    const result = await client.query<Expense>(
      `
      SELECT
        e.id,
        e.name,
        e.description,
        e.currency,
        e.created_at,
        e.updated_at,
        COALESCE(
          (SELECT array_agg(ue2.user_id ORDER BY ue2.user_id)
           FROM user_expense ue2
           WHERE ue2.expense_id = e.id),
          '{}'
        ) AS user_ids
      FROM expense e
      JOIN user_expense ue ON e.id = ue.expense_id
      WHERE ue.user_id = $1
      ORDER BY e.updated_at DESC
      LIMIT 100;
      `,
      [userId],
    )

    return result.rows
  } finally {
    client.release()
  }
}

export async function updateExpenseInDatabase(
  userId: string,
  expenseId: number,
  patch: ExpenseUpdateInput,
): Promise<Expense> {
  const client = await pool.connect()

  try {
    const access = await userHasExpenseAccess(userId, expenseId)
    if (!access) {
      throw new NotFoundError()
    }

    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (patch.name !== undefined) {
      fields.push(`name = $${i++}`)
      values.push(patch.name)
    }
    if (patch.currency !== undefined) {
      fields.push(`currency = $${i++}`)
      values.push(patch.currency)
    }
    if (patch.description !== undefined) {
      fields.push(`description = $${i++}`)
      values.push(patch.description ?? null)
    }

    if (fields.length === 0) {
      return getExpenseFromDatabaseById(userId, expenseId)
    }

    values.push(expenseId)

    await client.query(
      `
      UPDATE expense
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${i}
      `,
      values,
    )

    return getExpenseFromDatabaseById(userId, expenseId)
  } finally {
    client.release()
  }
}

export async function deleteExpenseFromDatabase(
  userId: string,
  expenseId: number,
): Promise<void> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const access = await client.query(
      `SELECT 1 FROM user_expense WHERE user_id = $1 AND expense_id = $2`,
      [userId, expenseId],
    )
    if (access.rowCount === 0) {
      throw new NotFoundError()
    }

    await client.query(`DELETE FROM payment_allocations WHERE payment_id IN (SELECT id FROM payments WHERE expense_id = $1)`, [expenseId])
    await client.query(`DELETE FROM payments WHERE expense_id = $1`, [expenseId])
    await client.query(`DELETE FROM settlement WHERE expense_id = $1`, [expenseId])
    await client.query(`DELETE FROM user_expense WHERE expense_id = $1`, [expenseId])
    await client.query(`DELETE FROM expense WHERE id = $1`, [expenseId])

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function addUserToExpenseInDatabase(
  requesterId: string,
  expenseId: number,
  targetUserId: string,
): Promise<void> {
  const access = await userHasExpenseAccess(requesterId, expenseId)
  if (!access) {
    throw new NotFoundError()
  }

  await pool.query(
    `
    INSERT INTO user_expense (user_id, expense_id)
    SELECT $1, $2
    WHERE NOT EXISTS (
      SELECT 1 FROM user_expense WHERE user_id = $1 AND expense_id = $2
    );
    `,
    [targetUserId, expenseId],
  )
}

export async function removeUserFromExpenseInDatabase(
  requesterId: string,
  expenseId: number,
  targetUserId: string,
): Promise<void> {
  const access = await userHasExpenseAccess(requesterId, expenseId)
  if (!access) {
    throw new NotFoundError()
  }

  await pool.query(
    `DELETE FROM user_expense WHERE user_id = $1 AND expense_id = $2`,
    [targetUserId, expenseId],
  )
}
