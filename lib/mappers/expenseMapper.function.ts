import { Expense, ExpenseCreateInput } from '@/lib/schemas/expense.schema'
import { ICreateExpense, IExpense, IExpenseParticipant } from '@/types/expense.interface'
import { ExpenseParticipant } from '@/lib/schemas/expense-participant.schema'
import { mapUserPublicRecord } from '@/lib/mappers/userMapper.function'

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
    description: expense.description,
    createdAt: expense.created_at.toISOString(),
    updatedAt: expense.updated_at.toISOString(),

    amountTotal: expense.amount_total,
    isAllPaid: expense.is_all_paid,
    participants: expense.participants.map(mapExpenseParticipant),
  }
}

function mapExpenseParticipant(participant: ExpenseParticipant): IExpenseParticipant {
  return {
    user: mapUserPublicRecord(participant.user),
    amountPaid: participant.amount_paid,
    amountOwed: participant.amount_owed,
    amountNet: participant.amount_net,
  }
}
