import { parseJsonBody } from '@/lib/api/body'
import { json, runRoute } from '@/lib/api/http'
import { requirePositiveIntParam } from '@/lib/api/params'
import { getSessionUserId } from '@/lib/api/session'
import type { ExpenseReadStateUpdateInput } from '@/lib/schemas/expense-read-state.schema'
import {
  getExpenseReadState,
  markExpenseReadThroughActivity,
} from '@/lib/services/expense-read-state.service'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const expenseId = requirePositiveIntParam(raw, 'expense id')
    const state = await getExpenseReadState(userId, expenseId)
    return json({
      lastReadAt: state.last_read_at.getTime(),
      lastReadActivity: state.last_read_activity_date && state.last_read_activity_id !== null
        && state.last_read_activity_type
        ? {
          activityDate: state.last_read_activity_date,
          activityId: state.last_read_activity_id,
          activityType: state.last_read_activity_type,
        }
        : null,
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  })
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRoute(async () => {
    const userId = await getSessionUserId()
    const { id: raw } = await context.params
    const expenseId = requirePositiveIntParam(raw, 'expense id')
    const body = await parseJsonBody<ExpenseReadStateUpdateInput>(request)
    const state = await markExpenseReadThroughActivity(userId, expenseId, body)
    return json({
      lastReadAt: state.last_read_at.getTime(),
      lastReadActivity: state.last_read_activity_date && state.last_read_activity_id !== null
        && state.last_read_activity_type
        ? {
          activityDate: state.last_read_activity_date,
          activityId: state.last_read_activity_id,
          activityType: state.last_read_activity_type,
        }
        : null,
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  })
}
