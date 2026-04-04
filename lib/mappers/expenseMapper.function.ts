import { Expense, ExpenseCreateInput, ExpenseUserOwed } from '@/lib/schemas/expense.schema'
import { ICreateExpense, IExpense, IExpenseUserOwed } from '@/types/expense.interface'

export function mapExpenseInput(expense: ICreateExpense): ExpenseCreateInput {
  return {
    name: expense.name,
    currency: expense.currency,
    description: expense.description,
  }
}

export function mapExpenseRecord(expense: Expense): IExpense {
  return {
    id: expense.id,
    name: expense.name,
    currency: expense.currency,
    description: expense.description ?? undefined,
    createdAt: expense.created_at.getTime(),
    updatedAt: expense.updated_at.getTime(),
    userIds: expense.user_ids,
  }
}

export function mapExpenseOwedRows(owed: ExpenseUserOwed[]): IExpenseUserOwed[] {
  return owed.map((o) => ({
    userId: o.user_id,
    amountNet: o.amount_net,
  }))
}
