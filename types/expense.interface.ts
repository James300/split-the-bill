export interface IExpense {
  id: number
  name: string
  currency: string
  description?: string
  createdAt: string
  updatedAt: string
  userIds: string[]
}

export interface ICreateExpense extends Omit<
  IExpense,
  'id' | 'createdAt' | 'updatedAt' | 'userIds'
> {}

export interface IExpenseUserOwed {
  userId: string
  amountNet: number
}
