import { IEntity } from './common.interface'

export interface IPayment extends IEntity {
  expenseId: number
  paidByUserId: string
  amount: number
}

export interface IPaymentCreate extends Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IPaymentUpdate extends Partial<Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'>> {}

export interface IPaymentAllocation extends IEntity {
  paymentId: number
  userId: string
  amount: number
}

export interface IPaymentAllocationCreate extends Omit<IPaymentAllocation, 'createdAt' | 'updatedAt'> {}

export interface IPaymentAllocationUpdate extends Partial<Omit<IPaymentAllocation, 'createdAt' | 'updatedAt'>> {}
