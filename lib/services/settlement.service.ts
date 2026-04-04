import {
  createSettlementInDatabase,
  deleteSettlementFromDatabase,
  getSettlementFromDatabaseById,
  getSettlementsFromDatabaseByExpenseId,
  getSettlementsFromDatabaseByExpenseIdSince,
  updateSettlementInDatabase,
} from '@/lib/db/settlement.repo'
import { requireExpenseMember } from '@/lib/access/expense-member'
import {
  Settlement,
  SettlementCreateInput,
  SettlementCreateSchema,
  SettlementUpdateInput,
  SettlementUpdateSchema,
} from '@/lib/schemas/settlement.schema'
import { ValidationError } from '@/lib/utils/validation/validation-error'

export async function createSettlement(
  userId: string,
  input: SettlementCreateInput,
): Promise<Settlement> {
  const validationResult = SettlementCreateSchema.safeParse(input)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  await requireExpenseMember(userId, validationResult.data.expense_id)
  return createSettlementInDatabase(validationResult.data)
}

export async function getSettlementById(
  userId: string,
  settlementId: number,
): Promise<Settlement | null> {
  const row = await getSettlementFromDatabaseById(settlementId)
  if (!row) {
    return null
  }
  await requireExpenseMember(userId, row.expense_id)
  return row
}

export async function listSettlementsForExpense(
  userId: string,
  expenseId: number,
): Promise<Settlement[]> {
  await requireExpenseMember(userId, expenseId)
  return getSettlementsFromDatabaseByExpenseId(expenseId)
}

export async function listSettlementsForExpenseSince(
  userId: string,
  expenseId: number,
  since: number,
): Promise<Settlement[]> {
  await requireExpenseMember(userId, expenseId)
  return getSettlementsFromDatabaseByExpenseIdSince(expenseId, since)
}

export async function updateSettlement(
  userId: string,
  settlementId: number,
  patch: SettlementUpdateInput,
): Promise<Settlement | null> {
  const validationResult = SettlementUpdateSchema.safeParse(patch)

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw new ValidationError('Validation failed', errors)
  }

  const existing = await getSettlementFromDatabaseById(settlementId)
  if (!existing) {
    return null
  }
  await requireExpenseMember(userId, existing.expense_id)
  return updateSettlementInDatabase(settlementId, validationResult.data)
}

export async function deleteSettlement(
  userId: string,
  settlementId: number,
): Promise<boolean> {
  const existing = await getSettlementFromDatabaseById(settlementId)
  if (!existing) {
    return false
  }
  await requireExpenseMember(userId, existing.expense_id)
  return deleteSettlementFromDatabase(settlementId)
}
