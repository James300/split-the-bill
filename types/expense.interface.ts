import { IEntity } from './common.interface'

export interface IExpense extends IEntity {
  name: string
  currency: string
  description?: string
  userIds: string[]
  createdByUserId?: string | null
}

export interface ICreateExpense extends Omit<
  IExpense,
  'id' | 'createdAt' | 'updatedAt' | 'userIds'
> {}

export interface IExpenseUserOwed {
  userId: string
  amountNet: number
}
