import { Payment } from '@/lib/schemas/payment.schema'
import { PaymentAllocation } from '@/lib/schemas/payment-allocation.schema'
import { Settlement } from '@/lib/schemas/settlement.schema'

import { getUserPaymentsMap } from './getUserPaymentsMap.function'
import { getUserPaymentAllocationsMap } from './getUserPaymentAllocationsMap.function'
import { getUserSettlementsMap } from './getUserSettlementsMap.function'

export type ExpenseParticipantBalance = {
  userId: string
  amount_paid: number
  amount_owed: number
  amount_net: number
}

export function buildExpenseReadModel({
  userIds,
  payments,
  paymentAllocations,
  settlements,
}: {
  userIds: string[]
  payments: Payment[]
  paymentAllocations: PaymentAllocation[]
  settlements: Settlement[]
}): ExpenseParticipantBalance[] {
  const activePayments = payments.filter((payment) => !payment.deleted_at)
  const activePaymentIds = new Set(activePayments.map((payment) => payment.id))
  const activeAllocations = paymentAllocations.filter((allocation) =>
    !allocation.deleted_at && activePaymentIds.has(allocation.payment_id),
  )
  const activeSettlements = settlements.filter((settlement) => !settlement.deleted_at)
  const userPaymentsMap = getUserPaymentsMap(activePayments)
  const userPaymentAllocationsMap = getUserPaymentAllocationsMap(activeAllocations)
  const { payerSettlementsMap, payeeSettlementsMap } = getUserSettlementsMap(activeSettlements)

  return userIds.map((userId) => {
    const userPayments = userPaymentsMap[userId] ?? []
    const userPaymentAllocations = userPaymentAllocationsMap[userId] ?? []
    const payerSettlements = payerSettlementsMap[userId] ?? []
    const payeeSettlements = payeeSettlementsMap[userId] ?? []

    const amountPaid = userPayments.reduce((sum, p) => sum + p.amount, 0)
    const amountOwed = userPaymentAllocations.reduce((sum, a) => sum + a.amount, 0)
    const settlementsSent = payerSettlements.reduce((sum, s) => sum + s.amount, 0)
    const settlementsReceived = payeeSettlements.reduce((sum, s) => sum + s.amount, 0)

    const amountNet = amountPaid - amountOwed + settlementsSent - settlementsReceived

    return {
      userId,
      amount_paid: amountPaid,
      amount_owed: amountOwed,
      amount_net: amountNet,
    }
  })
}
