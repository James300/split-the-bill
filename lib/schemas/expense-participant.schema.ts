import { z } from 'zod'
import { UserPublicSchema } from './user.schema'

export const ExpenseParticipantSchema = z.object({
  user: UserPublicSchema,

  amount_paid: z.number().int().nonnegative(),
  amount_owed: z.number().int().nonnegative(),
  amount_net: z.number().int(),
})

export type ExpenseParticipant = z.infer<typeof ExpenseParticipantSchema>
