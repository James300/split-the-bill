import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/errors/domain'
import { ValidationError } from '@/lib/utils/validation/validation-error'

export function json(
  data: unknown,
  init: ResponseInit & { status?: number } = {},
): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
}

export function jsonNoContent(): Response {
  return new Response(null, { status: 204 })
}

export function handleRouteError(error: unknown): Response {
  if (error instanceof ValidationError) {
    return json({ error: error.message, details: error.details }, { status: 400 })
  }

  if (error instanceof UnauthorizedError) {
    return json({ error: error.message }, { status: 401 })
  }

  if (error instanceof NotFoundError) {
    return json({ error: error.message }, { status: 404 })
  }

  if (error instanceof BadRequestError) {
    return json({ error: error.message }, { status: 400 })
  }

  console.error(error)
  return json(
    {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    },
    { status: 500 },
  )
}

export async function runRoute(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn()
  } catch (error) {
    return handleRouteError(error)
  }
}
