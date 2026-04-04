import { pool } from '@/lib/db'
import {
  User,
  UserCreateInput,
  UserUpdateInput,
} from '@/lib/schemas/user.schema'

export async function getUsersFromDatabase(): Promise<User[]> {
  const result = await pool.query<User>(
    `SELECT id, name, email, created_at, updated_at, deleted_at FROM "user" WHERE deleted_at IS NULL ORDER BY name`,
  )
  return result.rows
}

export async function getUsersFromDatabaseSince(since: number): Promise<User[]> {
  const sinceDate = new Date(since)
  const result = await pool.query<User>(
    `SELECT id, name, email, created_at, updated_at, deleted_at FROM "user" WHERE updated_at > $1 ORDER BY updated_at DESC`,
    [sinceDate],
  )
  return result.rows
}

export async function getUsersFromDatabaseByIds(ids: string[]): Promise<User[]> {
  if (ids.length === 0) {
    return []
  }
  const result = await pool.query<User>(
    `SELECT id, name, email, created_at, updated_at, deleted_at FROM "user" WHERE id = ANY($1::text[]) AND deleted_at IS NULL`,
    [ids],
  )
  return result.rows
}

export async function getUserFromDatabaseById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    `SELECT id, name, email, created_at, updated_at, deleted_at FROM "user" WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  )
  return result.rows[0] ?? null
}

export async function createUserInDatabase(input: UserCreateInput): Promise<User> {
  const result = await pool.query<User>(
    `
    INSERT INTO "user" (name, email)
    VALUES ($1, $2)
    RETURNING id, name, email, created_at, updated_at, deleted_at;
    `,
    [input.name, input.email],
  )
  return result.rows[0]
}

export async function updateUserInDatabase(
  id: string,
  patch: UserUpdateInput,
): Promise<User | null> {
  const fields: string[] = []
  const values: unknown[] = []
  let i = 1

  if (patch.name !== undefined) {
    fields.push(`name = $${i++}`)
    values.push(patch.name)
  }
  if (patch.email !== undefined) {
    fields.push(`email = $${i++}`)
    values.push(patch.email)
  }

  if (fields.length === 0) {
    return getUserFromDatabaseById(id)
  }

  fields.push(`updated_at = NOW()`)
  values.push(id)

  const result = await pool.query<User>(
    `
    UPDATE "user"
    SET ${fields.join(', ')}
    WHERE id = $${i}
    RETURNING id, name, email, created_at, updated_at, deleted_at;
    `,
    values,
  )

  return result.rows[0] ?? null
}

export async function deleteUserFromDatabase(id: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE "user" SET deleted_at = NOW() WHERE id = $1`,
    [id],
  )
  return (result.rowCount ?? 0) > 0
}
