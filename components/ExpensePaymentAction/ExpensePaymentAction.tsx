'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Dialog from '@/components/Dialog'
import IconButton from '@/components/IconButton/IconButton'
import ExpensePaymentManager from '@/components/ExpensePaymentManager/ExpensePaymentManager'
import { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'

export default function ExpensePaymentAction({ expenseId }: { expenseId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const membersState = useExpenseMembers(expenseId, isOpen)

  return (
    <>
      <IconButton
        type='button'
        aria-label='Create new payment'
        title='Create new payment'
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className='h-11 w-11 bg-primary p-0 text-primary-foreground hover:bg-primary-hover'
      >
        <Plus aria-hidden='true' size={20} />
      </IconButton>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title='Add a payment'
        description='Record what was paid for, who paid, and who is sharing the cost.'
        className='max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden'
      >
        {isOpen && (
          <ExpensePaymentManager
            expenseId={expenseId}
            membersState={membersState}
            onCreated={() => setIsOpen(false)}
          />
        )}
      </Dialog>
    </>
  )
}
