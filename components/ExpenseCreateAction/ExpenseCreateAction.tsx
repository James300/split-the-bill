'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Dialog from '@/components/Dialog'
import IconButton from '@/components/IconButton/IconButton'
import ExpenseForm from '@/containers/ExpenseForm/ExpenseForm'

export default function ExpenseCreateAction() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <IconButton
        type='button'
        aria-label='Create new expense'
        title='Create new expense'
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
        title='Create an expense'
        description='Give your shared expense a name and choose its currency.'
        className='max-h-[90dvh] overflow-y-auto'
      >
        <ExpenseForm onCreated={() => setIsOpen(false)} />
      </Dialog>
    </>
  )
}
