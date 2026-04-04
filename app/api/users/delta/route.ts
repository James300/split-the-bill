import { json, runRoute } from '@/lib/api/http'
import { getSessionUserId } from '@/lib/api/session'
import { mapUserRecord } from '@/lib/mappers/userMapper.function'
import { listUsersSince } from '@/lib/services/user.service'
import { entityArrayToMap } from '@/lib/utils/entityArrayToMap'

export async function GET(request: Request) {
  return runRoute(async () => {
    await getSessionUserId()
    const url = new URL(request.url)
    const sinceParam = url.searchParams.get('since')
    
    if (!sinceParam) {
      return json({ error: 'Missing required query parameter: since' }, { status: 400 })
    }
    
    const since = parseInt(sinceParam, 10)
    if (isNaN(since)) {
      return json({ error: 'Invalid since parameter: must be a number' }, { status: 400 })
    }
    
    const users = await listUsersSince(since)
    return json(entityArrayToMap(users.map(mapUserRecord)))
  })
}
