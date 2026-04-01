import { parseJsonBody } from '@/lib/api/body'
import { json, jsonNoContent, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { NotFoundError } from '@/lib/errors/domain'
import {
  deleteSettlement,
  getSettlementById,
  updateSettlement,
} from '@/lib/services/settlement.service'
import { SettlementUpdateInput } from '@/lib/schemas/settlement.schema'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'settlement id')
    const settlement = await getSettlementById(userId, id)
    if (!settlement) {
      throw new NotFoundError()
    }
    return json(settlement)
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'settlement id')
    const body = await parseJsonBody<SettlementUpdateInput>(request)
    const settlement = await updateSettlement(userId, id, body)
    if (!settlement) {
      throw new NotFoundError()
    }
    return json(settlement)
  })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const id = requirePositiveIntParam(raw, 'settlement id')
    const deleted = await deleteSettlement(userId, id)
    if (!deleted) {
      throw new NotFoundError()
    }
    return jsonNoContent()
  })
}
