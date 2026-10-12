import { z } from 'zod'

export const PaymentSchema = z.object({
  id: z.number().int().positive(),
  expense_id: z.number().int().positive(),
  paid_by_user_id: z.string().min(1),
  amount: z.number().int().positive(),
  description: z.string().nullish(),
  date: z.coerce.date().nullable().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullish(),
  created_by_user_id: z.string().min(1).nullable().optional(),
})

export type Payment = z.infer<typeof PaymentSchema>

export const PaymentUpdateSchema = z.object({
  paid_by_user_id: z.string().min(1).max(64),
  amount: z.number().int().positive().max(2_147_483_647),
  description: z.string().trim().min(1).max(255),
  date: z.iso.date().nullable().optional(),
  participant_user_ids: z.array(z.string().min(1).max(64)).min(1).max(100),
}).superRefine((input, context) => {
  if (new Set(input.participant_user_ids).size !== input.participant_user_ids.length) {
    context.addIssue({
      code: 'custom',
      path: ['participant_user_ids'],
      message: 'A person can only be included once.',
    })
  }
  if (input.amount < input.participant_user_ids.length) {
    context.addIssue({
      code: 'custom',
      path: ['amount'],
      message: 'The total is too small to give each participant a share.',
    })
  }
})

export type PaymentUpdateInput = z.infer<typeof PaymentUpdateSchema>

export const ExpensePaymentCreateSchema = z.object({
  expenseId: z.number().int().positive(),
  description: z.string().trim().min(1).max(255),
  amount: z.number().int().positive().max(2_147_483_647),
  date: z.iso.date().nullable().optional(),
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
