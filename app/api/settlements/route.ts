import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { requireExpenseIdQuery } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import {
  mapSettlementInput,
  mapSettlementRecord,
} from '@/lib/mappers/settlementMapper.function'
import {
  createSettlement,
  listSettlementsForExpense,
} from '@/lib/services/settlement.service'
import { entityArrayToMap } from '@/lib/utils/entityArrayToMap'
import type { ISettlementCreate } from '@/types/settlement.interface'

export async function GET(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const expenseId = requireExpenseIdQuery(new URL(request.url))
    const settlements = await listSettlementsForExpense(userId, expenseId)
    return json(entityArrayToMap(settlements.map(mapSettlementRecord)))
  })
}

export async function POST(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const body = await parseJsonBody<ISettlementCreate>(request)
    const settlement = await createSettlement(userId, mapSettlementInput(body))
    return json(mapSettlementRecord(settlement), { status: 201 })
  })
}
