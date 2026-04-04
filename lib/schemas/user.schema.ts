import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(255),
  email: z.email(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullish(),
})

export type User = z.infer<typeof UserSchema>

export const UserPublicSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(255),
})

export type UserPublic = z.infer<typeof UserPublicSchema>

export const UserCreateSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email(),
})

export type UserCreateInput = z.infer<typeof UserCreateSchema>

export const UserUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.email().optional(),
})

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>
