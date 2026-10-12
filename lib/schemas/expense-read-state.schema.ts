import { z } from 'zod'

export const ExpenseReadStateUpdateSchema = z.object({
  paymentId: z.number().int().positive(),
})

export type ExpenseReadStateUpdateInput = z.infer<typeof ExpenseReadStateUpdateSchema>
