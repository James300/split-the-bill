import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { getSessionUserId } from '@/lib/api/session'
import { mapUserInput, mapUserRecord } from '@/lib/mappers/userMapper.function'
import { createUser, listUsers } from '@/lib/services/user.service'
import type { ICreateUser } from '@/types/user.interface'

export async function GET() {
  return runRoute(async () => {
    await getSessionUserId()

    // TODO: Only list users that are members of the current user's expenses
    // const users = await listUsers()
    return json({})
  })
}

export async function POST(request: Request) {
  return runRoute(async () => {
    await getSessionUserId()
    const data = await parseJsonBody<ICreateUser>(request)

    const user = await createUser(mapUserInput(data))
    return json(mapUserRecord(user), { status: 201 })
  })
}
