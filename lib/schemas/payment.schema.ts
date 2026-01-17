import { z } from 'zod'

export const PaymentSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  paid_by_user_id: z.number().int().positive(),
  amount: z.number().int().positive(),
})

export type Payment = z.infer<typeof PaymentSchema>

export const CreatePaymentSchema = z.object({
  expense_id: z.number().int().positive(),
  paid_by_user_id: z.number().int().positive(),
  amount: z.number().int().positive(),
})

export type PaymentInput = z.infer<typeof CreatePaymentSchema>
