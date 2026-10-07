import { json, runRoute } from '@/lib/api/http'
import { getSessionUserId } from '@/lib/api/session'
import { joinExpenseWithInvitation } from '@/lib/services/expense-invitation.service'

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { token } = await context.params
    const result = await joinExpenseWithInvitation(token, userId)
    return json(result)
  })
}
