import { PaymentAllocation } from '@/lib/schemas/payment-allocation.schema';

export function getUserPaymentAllocationsMap (paymentAllocations: PaymentAllocation[]) {
  const userPaymentAllocationsMap: Record<string, PaymentAllocation[]> = {}

  for (const paymentAllocation of paymentAllocations) {
    const userId = paymentAllocation.user_id

    if (!userPaymentAllocationsMap[userId]) {
      userPaymentAllocationsMap[userId] = []
    }

    userPaymentAllocationsMap[userId].push(paymentAllocation)
  }

  return userPaymentAllocationsMap
}
