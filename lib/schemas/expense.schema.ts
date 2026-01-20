import { z } from 'zod'
import { CurrencySchema } from './currency.schema'
import { ExpenseParticipantSchema } from './expense-participant.schema'

export const ExpenseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  currency: CurrencySchema,
  created_at: z.date(),
  updated_at: z.date(),

  is_all_paid: z.boolean(),
  amount_total: z.number().int().nonnegative(),

  participants: z.array(ExpenseParticipantSchema).min(1),
})

export type Expense = z.infer<typeof ExpenseSchema>

export const ExpenseCreateSchema = z.object({
  name: z.string().min(1).max(255),
  currency: CurrencySchema,
  description: z.string().optional(),
})

export type ExpenseCreateInput = z.infer<typeof ExpenseCreateSchema>

export const ExpenseUpdateSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  currency: CurrencySchema,
  description: z.string().optional(),
})

export type ExpenseUpdateInput = z.infer<typeof ExpenseUpdateSchema>

export const ExpenseUserAddSchema = z.object({
  expense_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
})

export type ExpenseUserAddInput = z.infer<typeof ExpenseUserAddSchema>

export const ExpenseUserRemoveSchema = z.object({
  expense_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
})

export type ExpenseUserRemoveInput = z.infer<typeof ExpenseUserRemoveSchema>
