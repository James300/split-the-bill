import { BadRequestError } from '@/lib/errors/domain'

export function parsePositiveInt(raw: string): number | null {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function requirePositiveIntParam(raw: string, label = 'id'): number {
  const n = parsePositiveInt(raw)
  if (n === null) {
    throw new BadRequestError(`Invalid ${label}`)
  }
  return n
}

export function requireExpenseIdQuery(url: URL): number {
  const raw = url.searchParams.get('expense_id')
  if (!raw) {
    throw new BadRequestError('Query parameter expense_id is required')
  }
  const id = parsePositiveInt(raw)
  if (id === null) {
    throw new BadRequestError('Invalid expense_id')
  }
  return id
}
