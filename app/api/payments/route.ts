import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { requireExpenseIdQuery } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { mapPaymentRecord, mapPaymentAllocationRecord } from '@/lib/mappers/paymentMapper.function'
import { createPaymentWithAllocations, listPaymentsForExpense } from '@/lib/services/payment.service'
import { entityArrayToMap } from '@/lib/utils/entityArrayToMap'
import type { ExpensePaymentCreateInput } from '@/lib/schemas/payment.schema'

export async function GET(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const expenseId = requireExpenseIdQuery(new URL(request.url))

    const payments = await listPaymentsForExpense(userId, expenseId)
    return json(entityArrayToMap(payments.map(mapPaymentRecord)), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  })
}

export async function POST(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const body = await parseJsonBody<ExpensePaymentCreateInput>(request)

    const result = await createPaymentWithAllocations(userId, body)
    return json({
      payment: mapPaymentRecord(result.payment),
      allocations: result.allocations.map(mapPaymentAllocationRecord),
    }, { status: 201 })
  })
}
