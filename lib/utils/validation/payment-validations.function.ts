export function verifyAllocationTotalsMatch(args: {
  paymentAmount: number
  allocations: { amount: number }[]
}) {
  const total = args.allocations.reduce((acc, alloc) => acc + alloc.amount, 0)

  if (total !== args.paymentAmount) {
    throw new Error('Total of allocations does not match payment amount')
  }
}

export function verifyUniqueAllocationUsers(allocations: { user_id: string }[]) {
  const userIds = allocations.map((alloc) => alloc.user_id)
  const uniqueUsers = new Set(userIds)

  if (uniqueUsers.size !== userIds.length) {
    throw new Error('Duplicate users in allocations')
  }
}
