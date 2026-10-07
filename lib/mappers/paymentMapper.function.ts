import { Payment } from '@/lib/schemas/payment.schema'
import { PaymentAllocation } from '@/lib/schemas/payment-allocation.schema'
import { IPayment, IPaymentAllocation } from '@/types/payment.interface'
import { createNotFoundEntity } from '@/lib/utils/createNotFoundEntity'

export function mapPaymentRecord(payment: Payment): IPayment {
  if (payment.deleted_at) {
    return createNotFoundEntity(payment.id) as IPayment
  }

  return {
    id: payment.id,
    expenseId: payment.expense_id,
    paidByUserId: payment.paid_by_user_id,
    amount: payment.amount,
    description: payment.description ?? undefined,
    createdAt: payment.created_at.getTime(),
    updatedAt: payment.updated_at.getTime(),
  }
}

export function mapPaymentAllocationRecord(allocation: PaymentAllocation): IPaymentAllocation {
  if (allocation.deleted_at) {
    return createNotFoundEntity(allocation.id) as IPaymentAllocation
  }

  return {
    id: allocation.id,
    paymentId: allocation.payment_id,
    userId: allocation.user_id,
    amount: allocation.amount,
    createdAt: allocation.created_at.getTime(),
    updatedAt: allocation.updated_at.getTime(),
  }
}
