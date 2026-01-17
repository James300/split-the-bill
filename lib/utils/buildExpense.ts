import { Expense } from '@/lib/schemas/expense.schema'
import { Payment } from '@/lib/schemas/payment.schema'
import { PaymentAllocation } from '@/lib/schemas/payment-allocation.schema'
import { Settlement } from '@/lib/schemas/settlment.schema'
import { User } from '@/lib/schemas/user.schema'

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
  const { payerSettlementsMap, payeeSettlementsMap} = getUserSettlementsMap(settlements)

  const N = users.length
  const baseOwed = Math.floor(expense.totalAmount / N)
  let remainder = expense.totalAmount % N

  return {
    ...expense,
    participants: users.map(user => {
      const owed = baseOwed + (remainder-- > 0 ? 1 : 0)
      const paid = payments[user.id] ?? 0

      return {
        user,
        paidAmount: paid,
        owedAmount: owed,
        netAmount: paid - owed,
      }
    }),
  }
}

function getUserPaymentsMap(
  payments: Payment[],
): Record<number, Payment[]>{
  const userPaymentsMap: Record<number, Payment[]> = {}

  for (const payment of payments) {
    const userId = payment.paid_by_user_id

    if (!userPaymentsMap[userId]) {
      userPaymentsMap[userId] = []
    }

    userPaymentsMap[userId].push(payment)
  }

  return userPaymentsMap
}

interface Temp {
  payerSettlementsMap: Record<number, Settlement[]>
  payeeSettlementsMap: Record<number, Settlement[]>
}

function getUserSettlementsMap(
  settlements: Settlement[],
): Temp {
  const payerSettlementsMap: Record<number, Settlement[]> = {}
  const payeeSettlementsMap: Record<number, Settlement[]> = {}

  for (const settlement of settlements) {
    const payerId = settlement.payer_user_id
    const payeeId = settlement.payee_user_id

    if (!payerSettlementsMap[payerId]) {
      payerSettlementsMap[payerId] = []
    }

    if (!payeeSettlementsMap[payeeId]) {
      payeeSettlementsMap[payeeId] = []
    }

    payerSettlementsMap[payerId].push(settlement)
    payeeSettlementsMap[payeeId].push(settlement)
  }
  
  return {
    payerSettlementsMap,
    payeeSettlementsMap,
  }
}
