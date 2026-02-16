import { createExpenseInDatabase, getExpensesFromDatabaseByUserId } from '@/lib/db/expense.repo'
import { Expense, ExpenseCreateInput, ExpenseCreateSchema } from '@/lib/schemas/expense.schema';
import { ValidationError } from '@/lib/utils/validation/validation-error';

export async function createExpense (
  userId: string,
  userName: string,
  expense: ExpenseCreateInput,
): Promise<Expense> {
  const validationResult = ExpenseCreateSchema.safeParse(expense)
  
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    
    throw new ValidationError('Validation failed', errors)
  }

  const expenseResult = await createExpenseInDatabase(userId, expense)

  return {
    ...expenseResult,
    participants: [
      {
        user: {
          id: userId,
          name: userName,
        },
        amount_net: 0,
        amount_owed: 0,
        amount_paid: 0,
      },
    ]
  }
}

export async function getExpensesByUserId(
  userId: string,
): Promise<Expense[]> {
  return await getExpensesFromDatabaseByUserId(userId)
}
