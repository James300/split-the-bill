import { z } from 'zod'

export const PaymentSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  paid_by_user_id: z.string().min(1),
  amount: z.number().int().positive(),
  description: z.string().nullish(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullish(),
})

export type Payment = z.infer<typeof PaymentSchema>

export const PaymentUpdateSchema = z.object({
  paid_by_user_id: z.string().min(1).optional(),
  amount: z.number().int().positive().optional(),
  description: z.string().trim().min(1).max(255).optional(),
})

export type PaymentUpdateInput = z.infer<typeof PaymentUpdateSchema>

export const ExpensePaymentCreateSchema = z.object({
  expenseId: z.number().int().positive(),
  description: z.string().trim().min(1).max(255),
  amount: z.number().int().positive().max(2_147_483_647),
  paidByUserId: z.string().min(1).max(64),
  participantUserIds: z.array(z.string().min(1).max(64)).min(1).max(100),
}).superRefine((input, context) => {
  if (new Set(input.participantUserIds).size !== input.participantUserIds.length) {
    context.addIssue({
      code: 'custom',
      path: ['participantUserIds'],
      message: 'A person can only be included once.',
    })
  }
  if (input.amount < input.participantUserIds.length) {
    context.addIssue({
      code: 'custom',
      path: ['amount'],
      message: 'The total is too small to give each participant a share.',
    })
  }
})

export type ExpensePaymentCreateInput = z.infer<typeof ExpensePaymentCreateSchema>
