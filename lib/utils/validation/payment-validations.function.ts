import { PaymentInput } from '@/lib/schemas/payment.schema';

export function verifyAllociationTotals(payment: PaymentInput) {
  const total = payment.allocations.reduce((acc, alloc) => acc + alloc.amount, 0);

  if (total !== payment.amount) {
    throw new Error("Total of allocations does not match payment amount");
  }
}

export function verifyUniqueUsers(payment: PaymentInput) {
  const userIds = payment.allocations.map(alloc => alloc.user_id);
  const uniqueUsers = new Set(userIds);

  if (uniqueUsers.size !== userIds.length) {
    throw new Error("Duplicate users in allocations");
  }
}
