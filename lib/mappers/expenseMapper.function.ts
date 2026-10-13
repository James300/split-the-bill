import { Expense, ExpenseCreateInput, ExpenseUserOwed } from '@/lib/schemas/expense.schema'
import { ICreateExpense, IExpense, IExpenseUserOwed } from '@/types/expense.interface'
import { createNotFoundEntity } from '@/lib/utils/createNotFoundEntity'

export function mapExpenseInput(expense: ICreateExpense): ExpenseCreateInput {
  return {
    name: expense.name,
    currency: expense.currency,
    description: expense.description,
  }
}

export function mapExpenseRecord(expense: Expense): IExpense {
  if (expense.deleted_at) {
    return createNotFoundEntity(expense.id) as IExpense
  }

  return {
    id: expense.id,
    name: expense.name,
    currency: expense.currency,
    description: expense.description ?? undefined,
    createdAt: expense.created_at.getTime(),
    updatedAt: expense.updated_at.getTime(),
    userIds: expense.user_ids,
    createdByUserId: expense.created_by_user_id ?? null,
    archivedAt: expense.archived_at?.getTime() ?? null,
  }
}

export function mapExpenseOwedRows(owed: ExpenseUserOwed[]): IExpenseUserOwed[] {
  return owed.map((o) => ({
    userId: o.user_id,
    amountNet: o.amount_net,
  }))
}
