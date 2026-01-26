import { IUserPublic } from '@/types/user.interface'

export interface IExpenseParticipant {
  user: IUserPublic
  amountPaid: number
  amountOwed: number
  amountNet: number
}

export interface IExpense {
  id: number
  name: string
  currency: string
  description?: string
  createdAt: string
  updatedAt: string

  isAllPaid: boolean
  amountTotal: number
  participants: IExpenseParticipant[]
}

export interface ICreateExpense extends Omit<
  IExpense,
  'id' |
  'createdAt' |
  'updatedAt' |
  'isAllPaid' |
  'amountTotal' |
  'participants'
> {}
