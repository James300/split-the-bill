import { Expense } from '@/lib/schemas/expense.schema'
import { Payment } from '@/lib/schemas/payment.schema'
import { PaymentAllocation } from '@/lib/schemas/payment-allocation.schema'
import { Settlement } from '@/lib/schemas/settlment.schema'
import { User } from '@/lib/schemas/user.schema'

import { getUserPaymentsMap } from './getUserPaymentsMap.function'
import { getUserPaymentAllocationsMap } from './getUserPaymentAllocationsMap.function'
import { getUserSettlementsMap } from './getUserSettlementsMap.function'

export function buildExpenseReadModel({
  expense,
  users,
  payments,
  paymentAllocations,
  settlements,
}: {
  expense: Expense
  users: User[]
  payments: Payment[]
  paymentAllocations: PaymentAllocation[]
  settlements: Settlement[]
}) {
  const userPaymentsMap = getUserPaymentsMap(payments)
  const userPaymentAllocationsMap = getUserPaymentAllocationsMap(paymentAllocations)
  const { payerSettlementsMap, payeeSettlementsMap} = getUserSettlementsMap(settlements)

  const amountTotal = payments.reduce((sum, p) => sum + p.amount, 0)

  const participants = users.map(user => {
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
      amountPaid,
      amountOwed,
      amountNet,
    }
  })

  const isAllPaid = participants.every(p => p.amountNet === 0)

  return {
    ...expense,
    isAllPaid,
    amountTotal,
    participants,
  }
}
