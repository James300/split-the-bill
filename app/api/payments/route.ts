import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { requireExpenseIdQuery } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import { createPayment, listPaymentsForExpense } from '@/lib/services/payment.service'
import { PaymentCreateInput } from '@/lib/schemas/payment.schema'

export async function GET(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const expenseId = requireExpenseIdQuery(new URL(request.url))

    const payments = await listPaymentsForExpense(userId, expenseId)
    return json(payments)
  })
}

export async function POST(request: Request) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const body = await parseJsonBody<PaymentCreateInput>(request)

    const payment = await createPayment(userId, body)
    return json(payment, { status: 201 })
  })
}
