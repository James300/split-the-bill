import { z } from 'zod'

export const ExpenseReadStateUpdateSchema = z.object({
  activityType: z.enum(['payment', 'settlement']),
  activityId: z.number().int().positive(),
})

export type ExpenseReadStateUpdateInput = z.infer<typeof ExpenseReadStateUpdateSchema>
