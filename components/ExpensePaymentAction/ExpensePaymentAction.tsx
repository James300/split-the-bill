'use client'

import { useState } from 'react'
import { ReceiptText } from 'lucide-react'
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
        aria-label='Add payment'
        title='Add payment'
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className='h-11 w-11 p-0'
      >
        <ReceiptText aria-hidden='true' size={18} />
      </IconButton>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title='Add a payment'
        description='Record what was paid for, who paid, and who is sharing the cost.'
        className='max-h-[90dvh] overflow-y-auto'
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
