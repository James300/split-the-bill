import { pool } from '@/lib/db'
import { initializeExpenseUserReadState } from '@/lib/db/expense-read-state.repo'
import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors/domain'
import { Expense, ExpenseCreateInput, ExpenseUpdateInput } from '@/lib/schemas/expense.schema'
import { PoolClient } from '@neondatabase/serverless'

type ExpenseQueryClient = Pick<PoolClient, 'query'>

async function hasExpenseCreatorColumn(client: ExpenseQueryClient): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'expense'
        AND column_name = 'created_by_user_id'
    ) AS exists`,
  )
  return Boolean(result.rows[0]?.exists)
}

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

    const hasCreatorColumn = await hasExpenseCreatorColumn(client)
    const expenseResult = hasCreatorColumn
      ? await client.query<{ id: number }>(
          `INSERT INTO expense (name, currency, description, created_by_user_id)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [expense.name, expense.currency, expense.description ?? null, userId],
        )
      : await client.query<{ id: number }>(
          `INSERT INTO expense (name, currency, description)
           VALUES ($1, $2, $3) RETURNING id`,
          [expense.name, expense.currency, expense.description ?? null],
        )

    const expenseRow = expenseResult.rows[0]

    await createUserExpense(client, userId, expenseRow.id)
    await initializeExpenseUserReadState(client, userId, expenseRow.id)

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
  const creatorColumn = await hasExpenseCreatorColumn(client)
    ? 'e.created_by_user_id'
    : 'NULL::text AS created_by_user_id'
  const result = await client.query<Expense>(
    `
    SELECT
      e.id,
      e.name,
      e.description,
      e.currency,
      e.created_at,
      e.updated_at,
      e.deleted_at,
      ${creatorColumn},
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
        e.deleted_at,
        COALESCE(
          (SELECT array_agg(ue2.user_id ORDER BY ue2.user_id)
           FROM user_expense ue2
           WHERE ue2.expense_id = e.id),
          '{}'
        ) AS user_ids
      FROM expense e
      JOIN user_expense ue ON e.id = ue.expense_id
      WHERE ue.user_id = $1 AND e.id = $2 AND e.deleted_at IS NULL
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
        e.deleted_at,
        COALESCE(
          (SELECT array_agg(ue2.user_id ORDER BY ue2.user_id)
           FROM user_expense ue2
           WHERE ue2.expense_id = e.id),
          '{}'
        ) AS user_ids
      FROM expense e
      JOIN user_expense ue ON e.id = ue.expense_id
      WHERE ue.user_id = $1 AND e.deleted_at IS NULL
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

export async function getExpensesFromDatabaseByUserIdSince(
  userId: string,
  since: number,
): Promise<Expense[]> {
  const client = await pool.connect()
  const sinceDate = new Date(since)

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
        e.deleted_at,
        COALESCE(
          (SELECT array_agg(ue2.user_id ORDER BY ue2.user_id)
           FROM user_expense ue2
           WHERE ue2.expense_id = e.id),
          '{}'
        ) AS user_ids
      FROM expense e
      JOIN user_expense ue ON e.id = ue.expense_id
      WHERE ue.user_id = $1 AND e.updated_at > $2
      ORDER BY e.updated_at DESC
      LIMIT 100;
      `,
      [userId, sinceDate],
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
    const access = await client.query(
      `SELECT 1 FROM user_expense WHERE user_id = $1 AND expense_id = $2`,
      [userId, expenseId],
    )
    if (access.rowCount === 0) {
      throw new NotFoundError()
    }

    await client.query(`UPDATE expense SET deleted_at = NOW() WHERE id = $1`, [expenseId])
  } finally {
    client.release()
  }
}

export async function addUserToExpenseInDatabase(
  requesterId: string,
  expenseId: number,
  targetUserId: string,
): Promise<void> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const access = await client.query(
      `SELECT 1 FROM user_expense WHERE user_id = $1 AND expense_id = $2`,
      [requesterId, expenseId],
    )
    if (access.rowCount === 0) {
      throw new NotFoundError()
    }

    await client.query(
      `INSERT INTO user_expense (user_id, expense_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, expense_id) DO NOTHING`,
      [targetUserId, expenseId],
    )
    await initializeExpenseUserReadState(client, targetUserId, expenseId)
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function removeUserFromExpenseInDatabase(
  requesterId: string,
  expenseId: number,
  targetUserId: string,
): Promise<void> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (!(await hasExpenseCreatorColumn(client))) {
      throw new NotFoundError()
    }

    const expenseResult = await client.query<{ created_by_user_id: string | null }>(
      `SELECT created_by_user_id FROM expense WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
      [expenseId],
    )
    const creatorId = expenseResult.rows[0]?.created_by_user_id
    if (!creatorId) {
      throw new NotFoundError()
    }
    if (creatorId !== requesterId) {
      throw new ForbiddenError('Only the expense creator can remove members.')
    }
    if (targetUserId === creatorId) {
      throw new BadRequestError('The expense creator cannot be removed.')
    }

    const targetMembership = await client.query(
      `SELECT 1 FROM user_expense WHERE user_id::text = $1 AND expense_id = $2`,
      [targetUserId, expenseId],
    )
    if (targetMembership.rowCount === 0) {
      throw new NotFoundError()
    }

    const history = await client.query<{ has_history: boolean }>(
      `SELECT (
        EXISTS (SELECT 1 FROM payments p WHERE p.expense_id = $1 AND p.paid_by_user_id::text = $2 AND p.deleted_at IS NULL)
        OR EXISTS (
          SELECT 1 FROM payment_allocations pa JOIN payments p ON p.id = pa.payment_id
          WHERE p.expense_id = $1 AND pa.user_id::text = $2 AND pa.deleted_at IS NULL AND p.deleted_at IS NULL
        )
        OR EXISTS (
          SELECT 1 FROM settlement s WHERE s.expense_id = $1 AND s.deleted_at IS NULL
          AND (s.payer_user_id::text = $2 OR s.payee_user_id::text = $2)
        )
      ) AS has_history`,
      [expenseId, targetUserId],
    )
    if (history.rows[0]?.has_history) {
      throw new BadRequestError('This member has payment or settlement history and cannot be removed.')
    }

    await client.query(
      `DELETE FROM user_expense WHERE user_id::text = $1 AND expense_id = $2`,
      [targetUserId, expenseId],
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export interface ExpenseMemberRow {
  id: string
  name: string
  isCreator: boolean
  isCurrentUser: boolean
  canBeRemoved: boolean
}

export async function getExpenseMembersFromDatabase(
  viewerId: string,
  expenseId: number,
): Promise<{ members: ExpenseMemberRow[]; canManageMembers: boolean; currency: string }> {
  const hasCreatorColumn = await hasExpenseCreatorColumn(pool)
  const creatorColumn = hasCreatorColumn
    ? 'e.created_by_user_id'
    : 'NULL::text AS created_by_user_id'
  const creatorOrder = hasCreatorColumn
    ? '(ue.user_id::text = e.created_by_user_id) DESC, name ASC'
    : 'name ASC'
  const result = await pool.query<{
    id: string
    name: string
    created_by_user_id: string | null
    currency: string
  }>(
    `SELECT ue.user_id::text AS id,
      COALESCE(NULLIF(u.name, ''), 'Member') AS name,
      ${creatorColumn},
      e.currency
     FROM expense e
     JOIN user_expense ue ON ue.expense_id = e.id
     LEFT JOIN neon_auth."user" u ON u.id::text = ue.user_id::text
     WHERE e.id = $1 AND e.deleted_at IS NULL
       AND EXISTS (SELECT 1 FROM user_expense access WHERE access.expense_id = e.id AND access.user_id::text = $2)
      ORDER BY ${creatorOrder}`,
    [expenseId, viewerId],
  )

  if (result.rowCount === 0) {
    throw new NotFoundError()
  }

  const creatorId = result.rows[0].created_by_user_id
  const canManageMembers = creatorId !== null && creatorId === viewerId
  return {
    canManageMembers,
    currency: result.rows[0].currency,
    members: result.rows.map(({ id, name }) => ({
      id,
      name,
      isCreator: creatorId !== null && id === creatorId,
      isCurrentUser: id === viewerId,
      canBeRemoved: canManageMembers && id !== creatorId,
    })),
  }
}
