import { createHash, randomBytes } from 'node:crypto'

const INVITATION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function createExpenseInvitationToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashExpenseInvitationToken(token: string): string | null {
  if (token.length !== 43 || !INVITATION_TOKEN_PATTERN.test(token)) {
    return null
  }

  return createHash('sha256').update(token).digest('hex')
}
