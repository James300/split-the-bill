import { z } from 'zod'

export const PaymentSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  paid_by_user_id: z.string().min(1),
  amount: z.number().int().positive(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Payment = z.infer<typeof PaymentSchema>

export const PaymentCreateSchema = z.object({
  expense_id: z.number().int().positive(),
  paid_by_user_id: z.string().min(1),
  amount: z.number().int().positive(),
})

export type PaymentCreateInput = z.infer<typeof PaymentCreateSchema>

export const PaymentUpdateSchema = z.object({
  paid_by_user_id: z.string().min(1).optional(),
  amount: z.number().int().positive().optional(),
})

export type PaymentUpdateInput = z.infer<typeof PaymentUpdateSchema>
