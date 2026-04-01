import { BadRequestError } from '@/lib/errors/domain'

export async function parseJsonBody<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw new BadRequestError('Request body must be valid JSON')
  }
}
