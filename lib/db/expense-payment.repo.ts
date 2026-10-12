import { pool } from '@/lib/db'
import { BadRequestError, NotFoundError } from '@/lib/errors/domain'
import type { ExpensePaymentCreateInput, Payment } from '@/lib/schemas/payment.schema'
import type { PaymentAllocation } from '@/lib/schemas/payment-allocation.schema'
import { sortMemberIds } from '@/lib/utils/money'
import { hasPaymentCreatorColumn, hasPaymentDescriptionColumn } from '@/lib/db/payment.repo'

export interface CreatedExpensePayment {
  payment: Payment
  allocations: PaymentAllocation[]
}

export async function createExpensePaymentInDatabase(
  actorUserId: string,
  input: ExpensePaymentCreateInput,
): Promise<CreatedExpensePayment> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (!(await hasPaymentDescriptionColumn(client))) {
      throw new BadRequestError('Apply the payment description database migration before adding payments.')
    }
    if (!(await hasPaymentCreatorColumn(client))) {
      throw new BadRequestError('Apply database migration 0005_ledger_item_history before adding payments.')
    }

    const expenseAccess = await client.query<{ id: number }>(
      `SELECT e.id
       FROM expense e
       JOIN user_expense actor ON actor.expense_id = e.id
         AND actor.user_id::text = $2
       WHERE e.id = $1 AND e.deleted_at IS NULL
       FOR UPDATE OF e`,
      [input.expenseId, actorUserId],
    )
    if (expenseAccess.rowCount === 0) {
      throw new NotFoundError()
    }

    const requiredMemberIds = [...new Set([input.paidByUserId, ...input.participantUserIds])]
    const memberResult = await client.query<{ id: string }>(
      `SELECT user_id::text AS id
       FROM user_expense
       WHERE expense_id = $1 AND user_id::text = ANY($2::text[])`,
      [input.expenseId, requiredMemberIds],
    )
    const members = new Set(memberResult.rows.map((row) => row.id))
    if (requiredMemberIds.some((id) => !members.has(id))) {
      throw new BadRequestError('The payer and everyone sharing this payment must belong to this expense.')
    }

    const paymentResult = await client.query<Payment>(
      `INSERT INTO payments (
         expense_id, paid_by_user_id, amount, description, created_by_user_id, created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, expense_id, paid_by_user_id, amount, description, created_at, updated_at, deleted_at, created_by_user_id`,
      [input.expenseId, input.paidByUserId, input.amount, input.description, actorUserId],
    )
    const payment = paymentResult.rows[0]

    const sortedParticipantIds = sortMemberIds(input.participantUserIds)
    const baseShare = Math.floor(input.amount / sortedParticipantIds.length)
    const remainder = input.amount % sortedParticipantIds.length
    const allocations: PaymentAllocation[] = []

    for (const [index, userId] of sortedParticipantIds.entries()) {
      const allocationResult = await client.query<PaymentAllocation>(
        `INSERT INTO payment_allocations (
           payment_id, user_id, amount, created_at, updated_at
         )
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, payment_id, user_id, amount, created_at, updated_at, deleted_at`,
        [payment.id, userId, baseShare + (index < remainder ? 1 : 0)],
      )
      allocations.push(allocationResult.rows[0])
    }

    await client.query('COMMIT')
    return { payment, allocations }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
