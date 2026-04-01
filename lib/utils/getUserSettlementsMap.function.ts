import { Settlement } from '@/lib/schemas/settlement.schema'

export function getUserSettlementsMap(
  settlements: Settlement[],
): {
  payerSettlementsMap: Record<string, Settlement[]>
  payeeSettlementsMap: Record<string, Settlement[]>
} {
  const payerSettlementsMap: Record<string, Settlement[]> = {}
  const payeeSettlementsMap: Record<string, Settlement[]> = {}

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
