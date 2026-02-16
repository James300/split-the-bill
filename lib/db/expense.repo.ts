import { pool } from '@/lib/db'
import { Expense, ExpenseCreateInput } from '@/lib/schemas/expense.schema';
import { PoolClient } from '@neondatabase/serverless';

export async function createExpenseInDatabase(
  userId: string,
  expense: ExpenseCreateInput,
): Promise<Expense> {
  const client = await pool.connect();

  try {

    await client.query('BEGIN')

    const expenseResult = await client.query<Expense>(`
      INSERT INTO expense (name, currency)
      VALUES ($1, $2)
      RETURNING *;
    `,
    [expense.name, expense.currency])

    const expenseRow = expenseResult.rows[0]

    await createUserExpense(client, userId, expenseRow.id)

    await client.query('COMMIT')

    return expenseRow
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
  return await client.query(`
    INSERT INTO user_expense (user_id, expense_id)
    VALUES ($1, $2);
  `,
  [userId, expenseId])
}

export async function getExpensesFromDatabaseByUserId(
  userId: string,
): Promise<Expense[]> {
  const client = await pool.connect()

  try {
    const result = await client.query<Expense>(`
      SELECT expense.* FROM expense
      JOIN user_expense ON expense.id = user_expense.expense_id
      WHERE user_expense.user_id = $1
      ORDER BY expense.updated_at DESC
      LIMIT 10;
    `, [userId])

    return result.rows
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}
