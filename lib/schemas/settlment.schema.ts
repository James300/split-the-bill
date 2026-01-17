import { z } from 'zod'

export const SettlementSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  payer_user_id: z.number().int().positive(),
  payee_user_id: z.number().int().positive(),
  amount: z.number().int().positive(),
  date: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
})

export type Settlement = z.infer<typeof SettlementSchema>

export const SettlementCreateSchema = z.object({
  expense_id: z.number().int().positive(),
  payer_user_id: z.number().int().positive(),
  payee_user_id: z.number().int().positive(),
  amount: z.number().int().positive(),
  date: z.date().optional(),
})

export type SettlementCreateInput = z.infer<typeof SettlementCreateSchema>

export const SettlementUpdateSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  payer_user_id: z.number().int().positive(),
  payee_user_id: z.number().int().positive(),
  amount: z.number().int().positive(),
  date: z.date(),
})

export type SettlementUpdateInput = z.infer<typeof SettlementUpdateSchema>
