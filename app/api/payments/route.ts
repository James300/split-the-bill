import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { requireExpenseIdQuery } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { mapPaymentInput, mapPaymentRecord } from '@/lib/mappers/paymentMapper.function'
import { createPayment, listPaymentsForExpense } from '@/lib/services/payment.service'
import { entityArrayToMap } from '@/lib/utils/entityArrayToMap'
import type { IPaymentCreate } from '@/types/payment.interface'

export async function GET(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const expenseId = requireExpenseIdQuery(new URL(request.url))

    const payments = await listPaymentsForExpense(userId, expenseId)
    return json(entityArrayToMap(payments.map(mapPaymentRecord)))
  })
}

export async function POST(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const body = await parseJsonBody<IPaymentCreate>(request)

    const payment = await createPayment(userId, mapPaymentInput(body))
    return json(mapPaymentRecord(payment), { status: 201 })
  })
}
