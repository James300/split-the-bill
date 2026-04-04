import { Settlement, SettlementCreateInput } from '@/lib/schemas/settlement.schema'
import { ISettlement, ISettlementCreate } from '@/types/settlement.interface'

export function mapSettlementInput(settlement: ISettlementCreate): SettlementCreateInput {
  return {
    expense_id: settlement.expenseId,
    payer_user_id: settlement.payerUserId,
    payee_user_id: settlement.payeeUserId,
    amount: settlement.amount,
    date: settlement.date,
  }
}

export function mapSettlementRecord(settlement: Settlement): ISettlement {
  return {
    id: settlement.id,
    expenseId: settlement.expense_id,
    payerUserId: settlement.payer_user_id,
    payeeUserId: settlement.payee_user_id,
    amount: settlement.amount,
    date: settlement.date,
    createdAt: settlement.created_at.getTime(),
    updatedAt: settlement.updated_at.getTime(),
  }
}
