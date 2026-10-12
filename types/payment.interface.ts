import { IEntity } from './common.interface'

export interface IPayment extends IEntity {
  expenseId: number
  paidByUserId: string
  amount: number
  description?: string
  date: string
  createdByUserId: string | null
  deletedAt?: number
}

export interface IPaymentCreate extends Omit<IPayment, 'id' | 'createdAt' | 'updatedAt' | 'date'> {
  date?: string | null
}

export interface IPaymentUpdate extends Partial<Omit<IPayment, 'id' | 'createdAt' | 'updatedAt' | 'date'>> {
  date?: string | null
}

export interface IPaymentAllocation extends IEntity {
  paymentId: number
  userId: string
  amount: number
}

export type IPaymentAllocationCreate = Omit<IPaymentAllocation, 'createdAt' | 'updatedAt'>

export type IPaymentAllocationUpdate = Partial<Omit<IPaymentAllocation, 'createdAt' | 'updatedAt'>>
