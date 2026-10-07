import { json, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { BadRequestError } from '@/lib/errors/domain'
import { listAllocationsForPayment } from '@/lib/services/payment.service'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const paymentId = requirePositiveIntParam(raw, 'payment id')
    const allocations = await listAllocationsForPayment(userId, paymentId)
    return json(allocations)
  })
}

export async function POST(
  _request: Request,
  _context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    await getSessionUserId()
    throw new BadRequestError('Create a payment and all of its shares together through POST /api/payments.')
  })
}
