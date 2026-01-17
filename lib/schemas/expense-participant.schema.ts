import { z } from 'zod'
import { UserPublicSchema } from './user.schema'

export const ExpenseParticipantSchema = z.object({
  user: UserPublicSchema,

  paidAmount: z.number().int().nonnegative(),
  owedAmount: z.number().int().nonnegative(),

  netAmount: z.number().int(),
})

export type ExpenseParticipant = z.infer<typeof ExpenseParticipantSchema>
