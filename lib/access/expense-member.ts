import { userHasExpenseAccess } from '@/lib/db/expense.repo'
import { NotFoundError } from '@/lib/errors/domain'

/**
 * Ensures the user is linked to the expense via `user_expense`.
 * All expense-scoped data (payments, settlements, allocations) is authorized through this.
 */
export async function requireExpenseMember(
  userId: string,
  expenseId: number,
): Promise<void> {
  if (!(await userHasExpenseAccess(userId, expenseId))) {
    throw new NotFoundError()
  }
}
