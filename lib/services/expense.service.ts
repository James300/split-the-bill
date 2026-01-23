import { Expense, ExpenseCreateInput } from '@/lib/schemas/expense.schema';
import { verifyExpenseInput } from '@/lib/utils/validation/expense-validations.function';

export async function createExpense (expense: ExpenseCreateInput): Promise<Expense> {
  verifyExpenseInput(expense)

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
