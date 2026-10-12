import { IEntity } from './common.interface'

export interface ISettlement extends IEntity {
  expenseId: number
  payerUserId: string
  payeeUserId: string
  amount: number
  date: string
  createdByUserId: string | null
  deletedAt?: number
}

export interface ISettlementCreate extends Omit<ISettlement, 'id' | 'createdAt' | 'updatedAt' | 'date'> {
  date?: string | null
}

export interface ISettlementUpdate extends Partial<Omit<ISettlement, 'id' | 'createdAt' | 'updatedAt' | 'date'>> {
  date?: string | null
}
