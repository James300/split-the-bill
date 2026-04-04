import { json, runRoute } from '@/lib/api/http'
import { getSessionUserId } from '@/lib/api/session'
import { mapExpenseRecord } from '@/lib/mappers/expenseMapper.function'
import { getExpensesByUserIdSince } from '@/lib/services/expense.service'
import { entityArrayToMap } from '@/lib/utils/entityArrayToMap'

export async function GET(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const url = new URL(request.url)
    const sinceParam = url.searchParams.get('since')
    
    if (!sinceParam) {
      return json({ error: 'Missing required query parameter: since' }, { status: 400 })
    }
    
    const since = parseInt(sinceParam, 10)
    if (isNaN(since)) {
      return json({ error: 'Invalid since parameter: must be a number' }, { status: 400 })
    }
    
    const expenses = await getExpensesByUserIdSince(userId, since)
    return json(entityArrayToMap(expenses.map(mapExpenseRecord)))
  })
}
