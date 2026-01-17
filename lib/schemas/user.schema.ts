import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  email: z.email(),
  created_at: z.date(),
  updated_at: z.date(),
})

export type User = z.infer<typeof UserSchema>

export const UserPublicSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
})

export type UserPublic = z.infer<typeof UserPublicSchema>
