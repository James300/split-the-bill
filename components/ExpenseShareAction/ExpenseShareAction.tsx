'use client'

import { useState } from 'react'
import { Share2, X } from 'lucide-react'
import ExpenseInvitationManager from '@/components/ExpenseInvitationManager/ExpenseInvitationManager'
import Dialog from '@/components/Dialog'
import IconButton from '@/components/IconButton/IconButton'
import { useExpenseInvitationManager } from '@/hooks/useExpenseInvitationManager/useExpenseInvitationManager'

export default function ExpenseShareAction({ expenseId }: { expenseId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const invitationManager = useExpenseInvitationManager(expenseId)

  return (
    <>
      <IconButton
        type='button'
        aria-label='Share expense'
        title='Share expense'
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className='h-11 w-11 p-0'
      >
        <Share2 aria-hidden='true' size={18} />
      </IconButton>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title='Share expense'
        description='Create a link to invite people to this expense.'
        className='max-h-[90dvh] overflow-y-auto'
      >
        <ExpenseInvitationManager {...invitationManager} />
      </Dialog>
    </>
  )
}
