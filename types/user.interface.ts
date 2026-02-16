export interface IUser {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface ICreateUser extends Omit<IUser, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IUserPublic extends Omit<IUser, 'email' | 'createdAt' | 'updatedAt'> {}
