import {
  createPaymentAllocationInDatabase,
  deletePaymentAllocationFromDatabase,
  getPaymentAllocationFromDatabase,
  getPaymentAllocationsFromDatabaseByExpenseId,
  getPaymentAllocationsFromDatabaseByPaymentId,
  updatePaymentAllocationInDatabase,
} from '@/lib/db/payment-allocation.repo'
import {
  createPaymentInDatabase,
  deletePaymentFromDatabase,
  getPaymentFromDatabaseById,
  getPaymentsFromDatabaseByExpenseId,
  getPaymentsFromDatabaseByExpenseIdSince,
  updatePaymentInDatabase,
} from '@/lib/db/payment.repo'
import { requireExpenseMember } from '@/lib/access/expense-member'
import { NotFoundError } from '@/lib/errors/domain'
import {
  Payment,
  PaymentCreateInput,
  PaymentCreateSchema,
  PaymentUpdateInput,
  PaymentUpdateSchema,
} from '@/lib/schemas/payment.schema'
import {
  PaymentAllocation,
  PaymentAllocationCreateInput,
  PaymentAllocationCreateSchema,
  PaymentAllocationUpdateInput,
  PaymentAllocationUpdateSchema,
} from '@/lib/schemas/payment-allocation.schema'
import { ValidationError } from '@/lib/utils/validation/validation-error'

export async function createPayment(
  userId: string,
  input: PaymentCreateInput,
): Promise<Payment> {
  const validationResult = PaymentCreateSchema.safeParse(input)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  await requireExpenseMember(userId, validationResult.data.expense_id)
  return createPaymentInDatabase(validationResult.data)
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
  return updatePaymentInDatabase(paymentId, validationResult.data)
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
  return deletePaymentFromDatabase(paymentId)
}

export async function createPaymentAllocation(
  userId: string,
  input: PaymentAllocationCreateInput,
): Promise<PaymentAllocation> {
  const validationResult = PaymentAllocationCreateSchema.safeParse(input)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  const payment = await getPaymentFromDatabaseById(validationResult.data.payment_id)
  if (!payment) {
    throw new NotFoundError()
  }
  await requireExpenseMember(userId, payment.expense_id)
  return createPaymentAllocationInDatabase(validationResult.data)
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
  userId: string,
  paymentId: number,
  userIdRow: string,
  patch: PaymentAllocationUpdateInput,
): Promise<PaymentAllocation | null> {
  const validationResult = PaymentAllocationUpdateSchema.safeParse(patch)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  const payment = await getPaymentFromDatabaseById(paymentId)
  if (!payment) {
    return null
  }
  await requireExpenseMember(userId, payment.expense_id)
  return updatePaymentAllocationInDatabase(
    paymentId,
    userIdRow,
    validationResult.data,
  )
}

export async function deletePaymentAllocation(
  userId: string,
  paymentId: number,
  userIdRow: string,
): Promise<boolean> {
  const payment = await getPaymentFromDatabaseById(paymentId)
  if (!payment) {
    return false
  }
  await requireExpenseMember(userId, payment.expense_id)
  return deletePaymentAllocationFromDatabase(paymentId, userIdRow)
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
