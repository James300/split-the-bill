import { z } from 'zod'

export const SettlementSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  payer_user_id: z.string().min(1),
  payee_user_id: z.string().min(1),
  amount: z.number().int().positive(),
  date: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Settlement = z.infer<typeof SettlementSchema>

export const SettlementCreateSchema = z.object({
  expense_id: z.number().int().positive(),
  payer_user_id: z.string().min(1),
  payee_user_id: z.string().min(1),
  amount: z.number().int().positive(),
  date: z.coerce.date().optional(),
})

export type SettlementCreateInput = z.infer<typeof SettlementCreateSchema>

export const SettlementUpdateSchema = z.object({
  payer_user_id: z.string().min(1).optional(),
  payee_user_id: z.string().min(1).optional(),
  amount: z.number().int().positive().optional(),
  date: z.coerce.date().optional(),
})

export type SettlementUpdateInput = z.infer<typeof SettlementUpdateSchema>
