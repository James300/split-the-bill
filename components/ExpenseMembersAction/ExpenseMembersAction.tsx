'use client'

import { useState } from 'react'
import { UsersRound } from 'lucide-react'
import Dialog from '@/components/Dialog'
import IconButton from '@/components/IconButton/IconButton'
import ExpenseMembersManager from '@/components/ExpenseMembersManager/ExpenseMembersManager'
import { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'

export default function ExpenseMembersAction({ expenseId }: { expenseId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const membersState = useExpenseMembers(expenseId, isOpen)

  return (
    <>
      <IconButton
        type='button'
        aria-label='View expense members'
        title='View expense members'
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className='h-11 w-11 p-0'
      >
        <UsersRound aria-hidden='true' size={18} />
      </IconButton>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title='People in this expense'
        description='See who is part of this expense.'
        className='max-h-[90dvh] overflow-y-auto'
      >
        <ExpenseMembersManager membersState={membersState} />
      </Dialog>
    </>
  )
}
