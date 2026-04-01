import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { PaymentAllocationCreateInput } from '@/lib/schemas/payment-allocation.schema'
import {
  createPaymentAllocation,
  listAllocationsForPayment,
} from '@/lib/services/payment.service'

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
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const paymentId = requirePositiveIntParam(raw, 'payment id')
    const body = await parseJsonBody<PaymentAllocationCreateInput>(request)

    const allocation = await createPaymentAllocation(userId, {
      ...body,
      payment_id: paymentId,
    })
    return json(allocation, { status: 201 })
  })
}
