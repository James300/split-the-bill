import { IEntity } from './common.interface'

export interface IExpense extends IEntity {
  name: string
  currency: string
  description?: string
  userIds: string[]
  createdByUserId?: string | null
  archivedAt?: number | null
}

export type ICreateExpense = Omit<
  IExpense,
  'id' | 'createdAt' | 'updatedAt' | 'userIds'
>

export interface IExpenseUserOwed {
  userId: string
  amountNet: number
}
