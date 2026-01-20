import { ExpenseCreateInput } from '@/lib/schemas/expense.schema';

export function verifyExpenseInput(expense: ExpenseCreateInput) {
  if (!expense.name || expense.name.length > 255) {
    throw new Error("Valid expense name is required");
  }

  if (!expense.currency || expense.currency.length !== 3) {
    throw new Error("Valid expense currency is required");
  }
}
