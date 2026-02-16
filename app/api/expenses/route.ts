import { auth } from '@/lib/auth/server'
import { mapExpenseInput, mapExpenseRecord } from '@/lib/mappers/expenseMapper.function'
import { createExpense, getExpensesByUserId } from '@/lib/services/expense.service'
import { ValidationError } from '@/lib/utils/validation/validation-error'

export async function POST (request: Request) {
  const session = await auth.getSession()

  const user = session?.data?.user
  const userId = user?.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    let data
    try {
      data = await request.json()
    } catch (jsonError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const userName = user.name

    const mappedExpenseData = mapExpenseInput(data)
    const expense = await createExpense(
      userId,
      userName,
      mappedExpenseData,
    )
    const mappedExpense = mapExpenseRecord(expense)

    return new Response(JSON.stringify(mappedExpense), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: error.details 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function GET (request: Request) {
  const session = await auth.getSession()

  const user = session?.data?.user
  const userId = user?.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const expenses = await getExpensesByUserId(userId)

    return new Response(JSON.stringify(expenses), { status: 200 })
  } catch (error) {
    console.log('error', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
