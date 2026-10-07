import { z } from 'zod'

export const ExpenseInvitationSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  created_by_user_id: z.string().min(1),
  created_at: z.coerce.date(),
  expires_at: z.coerce.date(),
  revoked_at: z.coerce.date().nullish(),
})

export type ExpenseInvitation = z.infer<typeof ExpenseInvitationSchema>

export const ExpenseInvitationPreviewSchema = z.object({
  expense_id: z.number().int().positive(),
  expense_name: z.string().min(1),
  expires_at: z.coerce.date(),
  members: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  })),
})

export type ExpenseInvitationPreview = z.infer<typeof ExpenseInvitationPreviewSchema>
