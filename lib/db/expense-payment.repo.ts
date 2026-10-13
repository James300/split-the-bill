import { pool } from '@/lib/db'
import { assertExpenseWritable } from '@/lib/db/expense.repo'
import { BadRequestError } from '@/lib/errors/domain'
import type { ExpensePaymentCreateInput, Payment } from '@/lib/schemas/payment.schema'
import type { PaymentAllocation } from '@/lib/schemas/payment-allocation.schema'
import { sortMemberIds } from '@/lib/utils/money'
import {
  hasPaymentCreatorColumn,
  hasPaymentDateColumn,
  hasPaymentDescriptionColumn,
} from '@/lib/db/payment.repo'

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
    if (!(await hasPaymentDateColumn(client))) {
      throw new BadRequestError('Apply database migration 0006_ledger_activity_dates_and_read_cursor before adding payments.')
    }

    await assertExpenseWritable(client, actorUserId, input.expenseId)

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
         expense_id, paid_by_user_id, amount, description, date, created_by_user_id, created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, expense_id, paid_by_user_id, amount, description, date, created_at, updated_at, deleted_at, created_by_user_id`,
      [input.expenseId, input.paidByUserId, input.amount, input.description, input.date ?? null, actorUserId],
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
