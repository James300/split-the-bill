import { IEntity } from './common.interface'

export interface ISettlement extends IEntity {
  expenseId: number
  payerUserId: string
  payeeUserId: string
  amount: number
  date: Date
  createdByUserId: string | null
  deletedAt?: number
}

export interface ISettlementCreate extends Omit<ISettlement, 'id' | 'createdAt' | 'updatedAt'> {}

export interface ISettlementUpdate extends Partial<Omit<ISettlement, 'id' | 'createdAt' | 'updatedAt'>> {}
