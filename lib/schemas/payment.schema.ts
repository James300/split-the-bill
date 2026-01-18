import { z } from 'zod'
import { PaymentAllocationCreateSchema } from './payment-allocation.schema'

export const PaymentSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  paid_by_user_id: z.number().int().positive(),
  amount: z.number().int().positive(),
})

export type Payment = z.infer<typeof PaymentSchema>

export const PaymentCreateSchema = z.object({
  expense_id: z.number().int().positive(),
  paid_by_user_id: z.number().int().positive(),
  amount: z.number().int().positive(),
  allocations: z.array(PaymentAllocationCreateSchema).min(1),
})

export type PaymentInput = z.infer<typeof PaymentCreateSchema>

export const PaymentUpdateSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  paid_by_user_id: z.number().int().positive(),
  amount: z.number().int().positive(),
  allocations: z.array(PaymentAllocationCreateSchema).min(1),
})

export type PaymentUpdateInput = z.infer<typeof PaymentUpdateSchema>
