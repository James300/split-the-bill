import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { requireExpenseIdQuery } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import {
  createSettlement,
  listSettlementsForExpense,
} from '@/lib/services/settlement.service'
import { SettlementCreateInput } from '@/lib/schemas/settlement.schema'

export async function GET(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const expenseId = requireExpenseIdQuery(new URL(request.url))
    const settlements = await listSettlementsForExpense(userId, expenseId)
    return json(settlements)
  })
}

export async function POST(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const body = await parseJsonBody<SettlementCreateInput>(request)
    const settlement = await createSettlement(userId, body)
    return json(settlement, { status: 201 })
  })
}
