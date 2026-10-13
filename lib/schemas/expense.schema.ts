import { z } from 'zod'
import { CurrencySchema } from './currency.schema'

export const ExpenseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  currency: CurrencySchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullish(),
  archived_at: z.coerce.date().nullish(),
  created_by_user_id: z.string().nullish(),
  user_ids: z.array(z.string().min(1)),
})

export type Expense = z.infer<typeof ExpenseSchema>

export const ExpenseCreateSchema = z.object({
  name: z.string().min(1).max(255),
  currency: CurrencySchema,
  description: z.string().optional(),
})

export type ExpenseCreateInput = z.infer<typeof ExpenseCreateSchema>

export const ExpenseUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  currency: CurrencySchema.optional(),
  description: z.string().optional(),
})

export type ExpenseUpdateInput = z.infer<typeof ExpenseUpdateSchema>

export const ExpenseUserAddSchema = z.object({
  user_id: z.string().min(1).max(64),
})

export type ExpenseUserAddInput = z.infer<typeof ExpenseUserAddSchema>

export const ExpenseUserOwedSchema = z.object({
  user_id: z.string().min(1),
  amount_net: z.number().int(),
})

export type ExpenseUserOwed = z.infer<typeof ExpenseUserOwedSchema>
