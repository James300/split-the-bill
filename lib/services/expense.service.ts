import { Expense, ExpenseCreateInput, ExpenseCreateSchema } from '@/lib/schemas/expense.schema';
import { ValidationError } from '@/lib/utils/validation/validation-error';

export async function createExpense (expense: ExpenseCreateInput): Promise<Expense> {
  const validationResult = ExpenseCreateSchema.safeParse(expense)
  
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    
    throw new ValidationError('Validation failed', errors)
  }

  return {
    ...expense,
    id: 123,
    participants: [],
    amount_total: 0,
    is_all_paid: true,
    created_at: new Date(),
    updated_at: new Date()
  }
}
