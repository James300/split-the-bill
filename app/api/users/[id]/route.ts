import { parseJsonBody } from '@/lib/api/body'
import { json, jsonNoContent, runRoute } from '@/lib/api/http'
import { getSessionUserId } from '@/lib/api/session'
import { BadRequestError, NotFoundError } from '@/lib/errors/domain'
import { mapUserRecord } from '@/lib/mappers/userMapper.function'
import { deleteUser, getUserById, updateUser } from '@/lib/services/user.service'
import type { IUser } from '@/types/user.interface'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    await getSessionUserId()
    const { id } = await context.params
    if (!id) {
      throw new BadRequestError('Invalid id')
    }

    const user = await getUserById(id)
    if (!user) {
      throw new NotFoundError()
    }

    return json(mapUserRecord(user))
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    await getSessionUserId()
    const { id } = await context.params
    if (!id) {
      throw new BadRequestError('Invalid id')
    }

    const body = await parseJsonBody<Partial<Pick<IUser, 'name' | 'email'>>>(request)
    const user = await updateUser(id, body)
    if (!user) {
      throw new NotFoundError()
    }

    return json(mapUserRecord(user))
  })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    await getSessionUserId()
    const { id } = await context.params
    if (!id) {
      throw new BadRequestError('Invalid id')
    }

    const deleted = await deleteUser(id)
    if (!deleted) {
      throw new NotFoundError()
    }

    return jsonNoContent()
  })
}
