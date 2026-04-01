import { auth } from '@/lib/auth/server'
import { UnauthorizedError } from '@/lib/errors/domain'

export async function getSessionUserId(): Promise<string> {
  const session = await auth.getSession()
  const userId = session?.data?.user?.id
  if (!userId) {
    throw new UnauthorizedError()
  }
  return userId
}
