import { Payment, PaymentCreateInput } from '@/lib/schemas/payment.schema'
import { PaymentAllocation, PaymentAllocationCreateInput } from '@/lib/schemas/payment-allocation.schema'
import { IPayment, IPaymentCreate, IPaymentAllocation, IPaymentAllocationCreate } from '@/types/payment.interface'
import { createNotFoundEntity } from '@/lib/utils/createNotFoundEntity'

export function mapPaymentInput(payment: IPaymentCreate): PaymentCreateInput {
  return {
    expense_id: payment.expenseId,
    paid_by_user_id: payment.paidByUserId,
    amount: payment.amount,
  }
}

export function mapPaymentRecord(payment: Payment): IPayment {
  if (payment.deleted_at) {
    return createNotFoundEntity(payment.id) as IPayment
  }

  return {
    id: payment.id,
    expenseId: payment.expense_id,
    paidByUserId: payment.paid_by_user_id,
    amount: payment.amount,
    createdAt: payment.created_at.getTime(),
    updatedAt: payment.updated_at.getTime(),
  }
}

export function mapPaymentAllocationInput(allocation: IPaymentAllocationCreate): PaymentAllocationCreateInput {
  return {
    payment_id: allocation.paymentId,
    user_id: allocation.userId,
    amount: allocation.amount,
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
