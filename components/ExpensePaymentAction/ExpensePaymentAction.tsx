'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Dialog from '@/components/Dialog'
import IconButton from '@/components/IconButton/IconButton'
import ExpensePaymentManager from '@/components/ExpensePaymentManager/ExpensePaymentManager'
import { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'
import type { ExpensePaymentRecord, PaymentAllocationRecord } from '@/hooks/useExpensePayments/useExpensePayments'

export default function ExpensePaymentAction({
  expenseId,
  onCreated,
  editingPayment,
  editingAllocations,
  onEditComplete,
  pageRefreshKey,
}: {
  expenseId: string
  onCreated: () => void
  editingPayment?: ExpensePaymentRecord
  editingAllocations?: PaymentAllocationRecord[]
  onEditComplete: () => void
  pageRefreshKey: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isDialogOpen = isOpen || Boolean(editingPayment)
  const membersState = useExpenseMembers(expenseId, isDialogOpen, pageRefreshKey)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open && editingPayment) onEditComplete()
  }

  return (
    <>
      <IconButton
        type='button'
        aria-label='Create new payment'
        title='Create new payment'
        aria-haspopup='dialog'
        aria-expanded={isDialogOpen}
        onClick={() => setIsOpen(true)}
        className='h-11 w-11 bg-primary p-0 text-primary-foreground hover:bg-primary-hover'
      >
        <Plus aria-hidden='true' size={20} />
      </IconButton>
      <Dialog
        open={isDialogOpen}
        onOpenChange={handleOpenChange}
        title={editingPayment ? 'Edit payment' : 'Add a payment'}
        description={editingPayment
          ? 'Update the payment details and participant shares.'
          : 'Record what was paid for, who paid, and who is sharing the cost.'}
        className='max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden'
      >
        <ExpensePaymentManager
          key={editingPayment?.id ?? 'new-payment'}
          expenseId={expenseId}
          membersState={membersState}
          initialPayment={editingPayment}
          initialAllocations={editingAllocations}
          onCreated={() => {
            onCreated()
            if (editingPayment) onEditComplete()
            setIsOpen(false)
          }}
        />
      </Dialog>
    </>
  )
}
