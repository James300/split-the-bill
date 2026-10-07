'use client'

import Button from '@/components/Button'
import Input from '@/components/Input'
import type { useExpenseInvitationManager } from '@/hooks/useExpenseInvitationManager/useExpenseInvitationManager'

type ExpenseInvitationManagerProps = ReturnType<typeof useExpenseInvitationManager>

export default function ExpenseInvitationManager({
  invitation,
  shareUrl,
  isSaving,
  error,
  createInvitation,
  revokeInvitation,
}: ExpenseInvitationManagerProps) {
  const hasActiveLink = Boolean(invitation && shareUrl)

  return (
    <section className='flex flex-col gap-4' aria-label='Expense invitation controls'>
      {hasActiveLink && invitation && (
        <p className='text-sm text-muted-foreground'>
          Current link expires {new Date(invitation.expiresAt).toLocaleString()}.
        </p>
      )}

      {hasActiveLink && (
        <div className='flex flex-col gap-2'>
          <Input
            id='expense-share-link'
            label='Share link'
            className='min-h-11 w-full rounded-md bg-background px-3 py-2 text-sm'
            value={shareUrl}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      )}

      {!hasActiveLink ? (
        <Button type='button' className='min-h-11 w-full' onClick={createInvitation} disabled={isSaving}>
          {isSaving ? 'Working…' : 'Create share link'}
        </Button>
      ) : (
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' className='min-h-11 flex-1' onClick={createInvitation} disabled={isSaving}>
            {isSaving ? 'Working…' : 'Create new link'}
          </Button>
          <Button type='button' variant='destructive' className='min-h-11 flex-1' onClick={revokeInvitation} disabled={isSaving}>
            Revoke link
          </Button>
        </div>
      )}

      {hasActiveLink && <p className='text-xs text-muted-foreground'>Creating a new link revokes the previous one. Links can be used by more than one person until they expire or are revoked.</p>}
      {error && <p role='alert' className='text-sm text-destructive'>{error}</p>}
    </section>
  )
}
