import { User } from '@/lib/schemas/user.schema'
import { Payment } from '@/lib/schemas/payment.schema'
import { PaymentAllocation } from '@/lib/schemas/payment-allocation.schema'
import { Settlement } from '@/lib/schemas/settlement.schema'

import { getUserPaymentsMap } from './getUserPaymentsMap.function'
import { getUserPaymentAllocationsMap } from './getUserPaymentAllocationsMap.function'
import { getUserSettlementsMap } from './getUserSettlementsMap.function'

export type ExpenseParticipantBalance = {
  user: User
  amount_paid: number
  amount_owed: number
  amount_net: number
}

export function buildExpenseReadModel({
  users,
  payments,
  paymentAllocations,
  settlements,
}: {
  users: User[]
  payments: Payment[]
  paymentAllocations: PaymentAllocation[]
  settlements: Settlement[]
}): ExpenseParticipantBalance[] {
  const userPaymentsMap = getUserPaymentsMap(payments)
  const userPaymentAllocationsMap = getUserPaymentAllocationsMap(paymentAllocations)
  const { payerSettlementsMap, payeeSettlementsMap } = getUserSettlementsMap(settlements)

  return users.map((user) => {
    const userPayments = userPaymentsMap[user.id] ?? []
    const userPaymentAllocations = userPaymentAllocationsMap[user.id] ?? []
    const payerSettlements = payerSettlementsMap[user.id] ?? []
    const payeeSettlements = payeeSettlementsMap[user.id] ?? []

    const amountPaid = userPayments.reduce((sum, p) => sum + p.amount, 0)
    const amountOwed = userPaymentAllocations.reduce((sum, a) => sum + a.amount, 0)
    const settlementsSent = payerSettlements.reduce((sum, s) => sum + s.amount, 0)
    const settlementsReceived = payeeSettlements.reduce((sum, s) => sum + s.amount, 0)

    const amountNet = amountPaid - amountOwed - settlementsSent + settlementsReceived

    return {
      user,
      amount_paid: amountPaid,
      amount_owed: amountOwed,
      amount_net: amountNet,
    }
  })
}
