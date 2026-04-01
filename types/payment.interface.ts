import type { Payment, PaymentCreateInput, PaymentUpdateInput } from '@/lib/schemas/payment.schema'
import type {
  PaymentAllocation,
  PaymentAllocationCreateInput,
  PaymentAllocationUpdateInput,
} from '@/lib/schemas/payment-allocation.schema'

export type IPayment = Payment
export type IPaymentCreate = PaymentCreateInput
export type IPaymentUpdate = PaymentUpdateInput

export type IPaymentAllocation = PaymentAllocation
export type IPaymentAllocationCreate = PaymentAllocationCreateInput
export type IPaymentAllocationUpdate = PaymentAllocationUpdateInput
