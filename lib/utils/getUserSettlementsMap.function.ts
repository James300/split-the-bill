import { Settlement } from '@/lib/schemas/settlment.schema'

export function getUserSettlementsMap(
  settlements: Settlement[],
): {
  payerSettlementsMap: Record<number, Settlement[]>
  payeeSettlementsMap: Record<number, Settlement[]>
} {
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
