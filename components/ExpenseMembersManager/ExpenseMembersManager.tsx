'use client'

import { useState } from 'react'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import type { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'

export default function ExpenseMembersManager({
  membersState,
}: {
  membersState: ReturnType<typeof useExpenseMembers>
}) {
  const { members, canManageMembers, isLoading, removingUserId, error, removeMember } = membersState
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null)
  const hasKnownCreator = members.some((member) => member.isCreator)

  const confirmRemoval = async () => {
    if (!memberToRemove) return
    const removed = await removeMember(memberToRemove.id)
    if (removed) setMemberToRemove(null)
  }

  return (
    <>
      <section aria-label='Expense members' className='flex flex-col gap-3'>
        {isLoading && members.length === 0 && (
          <p role='status' className='text-sm text-muted-foreground'>Loading people…</p>
        )}
        {!isLoading && members.length === 0 && !error && (
          <p className='text-sm text-muted-foreground'>No members found.</p>
        )}
        {members.map((member) => (
          <div key={member.id} className='flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border px-3 py-2'>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium'>
                {member.name}{member.isCurrentUser ? ' (you)' : ''}
              </p>
              {member.isCreator && <p className='text-xs text-muted-foreground'>Expense creator</p>}
            </div>
            {canManageMembers && member.canBeRemoved && (
              <Button
                type='button'
                variant='destructive'
                className='min-h-10 shrink-0 px-3 py-2 text-sm'
                disabled={Boolean(removingUserId)}
                onClick={() => setMemberToRemove({ id: member.id, name: member.name })}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        {!canManageMembers && members.length > 0 && (
          <p className='text-xs text-muted-foreground'>
            {hasKnownCreator
              ? 'Only the expense creator can remove members.'
              : 'Member removal is unavailable because this expense has no recorded creator.'}
          </p>
        )}
        {error && <p role='alert' className='text-sm text-destructive'>{error}</p>}
      </section>

      <Dialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => { if (!open && !removingUserId) setMemberToRemove(null) }}
        title='Remove member?'
        description={memberToRemove ? `Remove ${memberToRemove.name} from this expense? Their existing transaction history will be kept.` : undefined}
      >
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button type='button' className='min-h-11' onClick={() => setMemberToRemove(null)} disabled={Boolean(removingUserId)}>
            Cancel
          </Button>
          <Button type='button' variant='destructive' className='min-h-11' onClick={confirmRemoval} disabled={Boolean(removingUserId)}>
            {removingUserId ? 'Removing…' : 'Remove member'}
          </Button>
        </div>
      </Dialog>
    </>
  )
}
