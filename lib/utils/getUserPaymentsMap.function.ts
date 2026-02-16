import { Payment } from '@/lib/schemas/payment.schema'

export function getUserPaymentsMap(
  payments: Payment[],
): Record<string, Payment[]>{
  const userPaymentsMap: Record<string, Payment[]> = {}

  for (const payment of payments) {
    const userId = payment.paid_by_user_id

    if (!userPaymentsMap[userId]) {
      userPaymentsMap[userId] = []
    }

    userPaymentsMap[userId].push(payment)
  }

  return userPaymentsMap
}
