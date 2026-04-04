import { parseJsonBody } from '@/lib/api/body'
import { json, jsonNoContent, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { BadRequestError, NotFoundError } from '@/lib/errors/domain'
import { PaymentAllocationUpdateInput } from '@/lib/schemas/payment-allocation.schema'
import {
  deletePaymentAllocation,
  getPaymentAllocation,
  updatePaymentAllocation,
} from '@/lib/services/payment.service'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; userId: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw, userId: targetUserId } = await context.params
    const paymentId = requirePositiveIntParam(raw, 'payment id')
    if (!targetUserId) {
      throw new BadRequestError('Invalid user id')
    }
    const row = await getPaymentAllocation(userId, paymentId, targetUserId)
    if (!row) {
      throw new NotFoundError()
    }
    return json(row)
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; userId: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw, userId: targetUserId } = await context.params
    const paymentId = requirePositiveIntParam(raw, 'payment id')
    if (!targetUserId) {
      throw new BadRequestError('Invalid user id')
    }
    const body = await parseJsonBody<PaymentAllocationUpdateInput>(request)
    const row = await updatePaymentAllocation(userId, paymentId, targetUserId, body)
    if (!row) {
      throw new NotFoundError()
    }
    return json(row)
  })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; userId: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw, userId: targetUserId } = await context.params
    const paymentId = requirePositiveIntParam(raw, 'payment id')
    if (!targetUserId) {
      throw new BadRequestError('Invalid user id')
    }
    const deleted = await deletePaymentAllocation(userId, paymentId, targetUserId)
    if (!deleted) {
      throw new NotFoundError()
    }
    return jsonNoContent()
  })
}
