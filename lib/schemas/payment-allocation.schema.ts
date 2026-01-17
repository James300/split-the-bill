import { z } from 'zod'

export const PaymentAllocationSchema = z.object({
  payment_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  amount: z.number().int().positive(),
})

export type PaymentAllocation = z.infer<typeof PaymentAllocationSchema>
