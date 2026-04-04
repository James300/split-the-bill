import { json, runRoute } from '@/lib/api/http'
import { requireExpenseIdQuery } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { mapSettlementRecord } from '@/lib/mappers/settlementMapper.function'
import { listSettlementsForExpenseSince } from '@/lib/services/settlement.service'
import { entityArrayToMap } from '@/lib/utils/entityArrayToMap'

export async function GET(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const expenseId = requireExpenseIdQuery(new URL(request.url))
    const url = new URL(request.url)
    const sinceParam = url.searchParams.get('since')
    
    if (!sinceParam) {
      return json({ error: 'Missing required query parameter: since' }, { status: 400 })
    }
    
    const since = parseInt(sinceParam, 10)
    if (isNaN(since)) {
      return json({ error: 'Invalid since parameter: must be a number' }, { status: 400 })
    }
    
    const settlements = await listSettlementsForExpenseSince(userId, expenseId, since, true)
    return json(entityArrayToMap(settlements.map(mapSettlementRecord)))
  })
}
