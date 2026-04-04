import { User, UserCreateInput, UserPublic } from '@/lib/schemas/user.schema'
import { ICreateUser, IUser, IUserPublic } from '@/types/user.interface'
import { createNotFoundEntity } from '@/lib/utils/createNotFoundEntity'

export function mapUserInput(user: ICreateUser): UserCreateInput {
  return {
    name: user.name,
    email: user.email,
  }
}

export function mapUserRecord(user: User): IUser {
  if (user.deleted_at) {
    return createNotFoundEntity(user.id) as IUser
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at.getTime(),
    updatedAt: user.updated_at.getTime(),
  }
}

export function mapUserPublicRecord(user: UserPublic): IUserPublic {
  return {
    id: user.id,
    name: user.name,
  }
}
