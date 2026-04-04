import { ITimestamped } from './common.interface'

export interface IUser extends ITimestamped {
  id: string
  name: string
  email: string
}

export interface ICreateUser extends Omit<IUser, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IUserPublic extends Omit<IUser, 'email' | 'createdAt' | 'updatedAt'> {}
