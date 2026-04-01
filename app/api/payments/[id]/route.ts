import { parseJsonBody } from '@/lib/api/body'
import { json, jsonNoContent, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { NotFoundError } from '@/lib/errors/domain'
import {
  deletePayment,
  getPaymentById,
  updatePayment,
} from '@/lib/services/payment.service'
import { PaymentUpdateInput } from '@/lib/schemas/payment.schema'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'payment id')
    const payment = await getPaymentById(userId, id)
    if (!payment) {
      throw new NotFoundError()
    }
    return json(payment)
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'payment id')
    const body = await parseJsonBody<PaymentUpdateInput>(request)

    const payment = await updatePayment(userId, id, body)
    if (!payment) {
      throw new NotFoundError()
    }

    return json(payment)
  })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'payment id')
    const deleted = await deletePayment(userId, id)
    if (!deleted) {
      throw new NotFoundError()
    }

    return jsonNoContent()
  })
}
