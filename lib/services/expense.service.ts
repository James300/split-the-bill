import {
  addUserToExpenseInDatabase,
  createExpenseInDatabase,
  deleteExpenseFromDatabase,
  getExpenseFromDatabaseById,
  getExpenseMembersFromDatabase,
  getExpensesFromDatabaseByUserId,
  getExpensesFromDatabaseByUserIdSince,
  removeUserFromExpenseInDatabase,
  updateExpenseInDatabase,
} from '@/lib/db/expense.repo'
import { getPaymentAllocationsFromDatabaseByExpenseId } from '@/lib/db/payment-allocation.repo'
import { getPaymentsFromDatabaseByExpenseId } from '@/lib/db/payment.repo'
import { getSettlementsFromDatabaseByExpenseId } from '@/lib/db/settlement.repo'
import { getUsersFromDatabaseByIds } from '@/lib/db/user.repo'
import {
  Expense,
  ExpenseCreateInput,
  ExpenseCreateSchema,
  ExpenseUpdateInput,
  ExpenseUpdateSchema,
  ExpenseUserAddInput,
  ExpenseUserAddSchema,
  ExpenseUserOwed,
} from '@/lib/schemas/expense.schema'
import { User } from '@/lib/schemas/user.schema'
import { buildExpenseReadModel } from '@/lib/utils/buildExpense'
import { ValidationError } from '@/lib/utils/validation/validation-error'

function ensureUserForBalance(id: string, loaded: User[]): User {
  const found = loaded.find((u) => u.id === id)
  if (found) {
    return found
  }
  const now = new Date()
  return {
    id,
    name: 'Unknown',
    email: 'unknown@example.com',
    created_at: now,
    updated_at: now,
  }
}

export async function createExpense(
  userId: string,
  expense: ExpenseCreateInput,
): Promise<Expense> {
  const validationResult = ExpenseCreateSchema.safeParse(expense)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  return createExpenseInDatabase(userId, validationResult.data)
}

export async function getExpenseById(
  userId: string,
  expenseId: number,
): Promise<Expense> {
  return getExpenseFromDatabaseById(userId, expenseId)
}

export async function getExpenseMembers(userId: string, expenseId: number) {
  return getExpenseMembersFromDatabase(userId, expenseId)
}

export async function getExpensesByUserId(userId: string): Promise<Expense[]> {
  return getExpensesFromDatabaseByUserId(userId)
}

export async function getExpensesByUserIdSince(userId: string, since: number): Promise<Expense[]> {
  return getExpensesFromDatabaseByUserIdSince(userId, since)
}

export async function updateExpense(
  userId: string,
  expenseId: number,
  patch: ExpenseUpdateInput,
): Promise<Expense> {
  const validationResult = ExpenseUpdateSchema.safeParse(patch)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  return updateExpenseInDatabase(userId, expenseId, validationResult.data)
}

export async function deleteExpense(
  userId: string,
  expenseId: number,
): Promise<void> {
  return deleteExpenseFromDatabase(userId, expenseId)
}

export async function addUserToExpense(
  requesterId: string,
  expenseId: number,
  body: ExpenseUserAddInput,
): Promise<void> {
  const validationResult = ExpenseUserAddSchema.safeParse(body)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  return addUserToExpenseInDatabase(
    requesterId,
    expenseId,
    validationResult.data.user_id,
  )
}

export async function removeUserFromExpense(
  requesterId: string,
  expenseId: number,
  targetUserId: string,
): Promise<void> {
  return removeUserFromExpenseInDatabase(requesterId, expenseId, targetUserId)
}

export async function getExpenseOwedByUser(
  userId: string,
  expenseId: number,
): Promise<ExpenseUserOwed[]> {
  const expense = await getExpenseFromDatabaseById(userId, expenseId)
  const usersLoaded = await getUsersFromDatabaseByIds(expense.user_ids)
  const users = expense.user_ids.map((id) => ensureUserForBalance(id, usersLoaded))
  const payments = await getPaymentsFromDatabaseByExpenseId(expenseId)
  const paymentAllocations =
    await getPaymentAllocationsFromDatabaseByExpenseId(expenseId)
  const settlements = await getSettlementsFromDatabaseByExpenseId(expenseId)

  const balances = buildExpenseReadModel({
    users,
    payments,
    paymentAllocations,
    settlements,
  })

  return balances.map((b) => ({
    user_id: b.user.id,
    amount_net: b.amount_net,
  }))
}
