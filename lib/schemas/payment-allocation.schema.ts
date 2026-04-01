import { z } from 'zod'

export const PaymentAllocationSchema = z.object({
  payment_id: z.number().int().positive(),
  user_id: z.string().min(1),
  amount: z.number().int().positive(),
})

export type PaymentAllocation = z.infer<typeof PaymentAllocationSchema>

export const PaymentAllocationCreateSchema = z.object({
  payment_id: z.number().int().positive(),
  user_id: z.string().min(1),
  amount: z.number().int().positive(),
})

export type PaymentAllocationCreateInput = z.infer<typeof PaymentAllocationCreateSchema>

export const PaymentAllocationUpdateSchema = z.object({
  user_id: z.string().min(1).optional(),
  amount: z.number().int().positive().optional(),
})

export type PaymentAllocationUpdateInput = z.infer<typeof PaymentAllocationUpdateSchema>
