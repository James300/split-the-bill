import {
  createUserInDatabase,
  deleteUserFromDatabase,
  getUserFromDatabaseById,
  getUsersFromDatabase,
  getUsersFromDatabaseSince,
  updateUserInDatabase,
} from '@/lib/db/user.repo'
import {
  User,
  UserCreateInput,
  UserCreateSchema,
  UserUpdateInput,
  UserUpdateSchema,
} from '@/lib/schemas/user.schema'
import { ValidationError } from '@/lib/utils/validation/validation-error'

export async function listUsers(): Promise<User[]> {
  return getUsersFromDatabase()
}

export async function listUsersSince(since: number): Promise<User[]> {
  return getUsersFromDatabaseSince(since)
}

export async function getUserById(id: string): Promise<User | null> {
  return getUserFromDatabaseById(id)
}

export async function createUser(input: UserCreateInput): Promise<User> {
  const validationResult = UserCreateSchema.safeParse(input)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  return createUserInDatabase(validationResult.data)
}

export async function updateUser(
  id: string,
  patch: UserUpdateInput,
): Promise<User | null> {
  const validationResult = UserUpdateSchema.safeParse(patch)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  return updateUserInDatabase(id, validationResult.data)
}

export async function deleteUser(id: string): Promise<boolean> {
  return deleteUserFromDatabase(id)
}
