import {
  getPaymentAllocationFromDatabase,
  getPaymentAllocationsFromDatabaseByExpenseId,
  getPaymentAllocationsFromDatabaseByPaymentId,
} from '@/lib/db/payment-allocation.repo'
import {
  deletePaymentFromDatabase,
  getPaymentFromDatabaseById,
  getPaymentsFromDatabaseByExpenseId,
  getPaymentsFromDatabaseByExpenseIdSince,
  updatePaymentInDatabase,
} from '@/lib/db/payment.repo'
import { createExpensePaymentInDatabase } from '@/lib/db/expense-payment.repo'
import { requireExpenseMember } from '@/lib/access/expense-member'
import { BadRequestError, NotFoundError } from '@/lib/errors/domain'
import {
  Payment,
  PaymentUpdateInput,
  PaymentUpdateSchema,
  ExpensePaymentCreateInput,
  ExpensePaymentCreateSchema,
} from '@/lib/schemas/payment.schema'
import {
  PaymentAllocation,
  PaymentAllocationUpdateInput,
} from '@/lib/schemas/payment-allocation.schema'
import { ValidationError } from '@/lib/utils/validation/validation-error'

export async function createPaymentWithAllocations(
  userId: string,
  input: ExpensePaymentCreateInput,
) {
  const validationResult = ExpensePaymentCreateSchema.safeParse(input)
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    throw new ValidationError('Validation failed', errors)
  }

  return createExpensePaymentInDatabase(userId, validationResult.data)
}

export async function getPaymentById(
  userId: string,
  paymentId: number,
): Promise<Payment | null> {
  const payment = await getPaymentFromDatabaseById(paymentId)
  if (!payment) {
    return null
  }
  await requireExpenseMember(userId, payment.expense_id)
  return payment
}

export async function listPaymentsForExpense(
  userId: string,
  expenseId: number,
): Promise<Payment[]> {
  await requireExpenseMember(userId, expenseId)
  return getPaymentsFromDatabaseByExpenseId(expenseId)
}

export async function listPaymentsForExpenseSince(
  userId: string,
  expenseId: number,
  since: number,
): Promise<Payment[]> {
  await requireExpenseMember(userId, expenseId)
  return getPaymentsFromDatabaseByExpenseIdSince(expenseId, since)
}

export async function updatePayment(
  userId: string,
  paymentId: number,
  patch: PaymentUpdateInput,
): Promise<Payment | null> {
  const validationResult = PaymentUpdateSchema.safeParse(patch)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  const existing = await getPaymentFromDatabaseById(paymentId)
  if (!existing) {
    return null
  }
  await requireExpenseMember(userId, existing.expense_id)
  if (existing.created_by_user_id !== userId) {
    throw new NotFoundError()
  }
  return updatePaymentInDatabase(paymentId, userId, validationResult.data)
}

export async function deletePayment(
  userId: string,
  paymentId: number,
): Promise<boolean> {
  const existing = await getPaymentFromDatabaseById(paymentId)
  if (!existing) {
    return false
  }
  await requireExpenseMember(userId, existing.expense_id)
  if (existing.created_by_user_id !== userId) {
    throw new NotFoundError()
  }
  return deletePaymentFromDatabase(paymentId, userId)
}

export async function listAllocationsForPayment(
  userId: string,
  paymentId: number,
): Promise<PaymentAllocation[]> {
  const payment = await getPaymentFromDatabaseById(paymentId)
  if (!payment) {
    throw new NotFoundError()
  }
  await requireExpenseMember(userId, payment.expense_id)
  return getPaymentAllocationsFromDatabaseByPaymentId(paymentId)
}

export async function listAllocationsForExpense(
  userId: string,
  expenseId: number,
): Promise<PaymentAllocation[]> {
  await requireExpenseMember(userId, expenseId)
  return getPaymentAllocationsFromDatabaseByExpenseId(expenseId)
}

export async function updatePaymentAllocation(
  _userId: string,
  _paymentId: number,
  _userIdRow: string,
  _patch: PaymentAllocationUpdateInput,
): Promise<PaymentAllocation | null> {
  void _userId
  void _paymentId
  void _userIdRow
  void _patch
  throw new BadRequestError('Edit a payment and all of its shares together through PATCH /api/payments/:id.')
}

export async function deletePaymentAllocation(
  _userId: string,
  _paymentId: number,
  _userIdRow: string,
): Promise<boolean> {
  void _userId
  void _paymentId
  void _userIdRow
  throw new BadRequestError('Delete a payment and its shares together through DELETE /api/payments/:id.')
}

export async function getPaymentAllocation(
  userId: string,
  paymentId: number,
  userIdRow: string,
): Promise<PaymentAllocation | null> {
  const payment = await getPaymentFromDatabaseById(paymentId)
  if (!payment) {
    return null
  }
  await requireExpenseMember(userId, payment.expense_id)
  return getPaymentAllocationFromDatabase(paymentId, userIdRow)
}
