import { requireExpenseMember } from '@/lib/access/expense-member'
import {
  getExpenseUserReadStateFromDatabase,
  markExpenseUserReadThroughActivityInDatabase,
} from '@/lib/db/expense-read-state.repo'
import { ValidationError } from '@/lib/utils/validation/validation-error'
import {
  ExpenseReadStateUpdateInput,
  ExpenseReadStateUpdateSchema,
} from '@/lib/schemas/expense-read-state.schema'

export async function getExpenseReadState(userId: string, expenseId: number) {
  await requireExpenseMember(userId, expenseId)
  return getExpenseUserReadStateFromDatabase(userId, expenseId)
}

export async function markExpenseReadThroughActivity(
  userId: string,
  expenseId: number,
  input: ExpenseReadStateUpdateInput,
) {
  const validation = ExpenseReadStateUpdateSchema.safeParse(input)
  if (!validation.success) {
    throw new ValidationError('Validation failed', validation.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })))
  }

  await requireExpenseMember(userId, expenseId)
  return markExpenseUserReadThroughActivityInDatabase(
    userId,
    expenseId,
    validation.data.activityType,
    validation.data.activityId,
  )
}
