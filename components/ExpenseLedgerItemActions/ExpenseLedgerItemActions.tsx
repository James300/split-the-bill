'use client'

import { useState } from 'react'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import { toast } from 'sonner'

type LedgerItemType = 'payment' | 'settlement'

export default function ExpenseLedgerItemActions({
  itemType,
  itemId,
  onEdit,
  onDeleted,
}: {
  itemType: LedgerItemType
  itemId: number
  onEdit: () => void
  onDeleted: () => void
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const label = itemType === 'payment' ? 'payment' : 'settlement'

  const confirmDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      const response = await fetch(`/${itemType === 'payment' ? 'api/payments' : 'api/settlements'}/${itemId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        let message = `Could not delete this ${label}.`
        try {
          const body = await response.json()
          if (typeof body.error === 'string') message = body.error
        } catch {
          message = `Could not delete this ${label}.`
        }
        throw new Error(message)
      }

      setIsConfirmOpen(false)
      toast.success(`${label[0].toUpperCase()}${label.slice(1)} deleted`)
      onDeleted()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : `Could not delete this ${label}.`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button type='button' className='min-h-11 px-3 py-2 text-sm' onClick={onEdit}>
        Edit
      </Button>
      <Button
        type='button'
        variant='destructive'
        className='min-h-11 px-3 py-2 text-sm'
        onClick={() => {
          setError(null)
          setIsConfirmOpen(true)
        }}
      >
        Delete
      </Button>
      <Dialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={`Delete ${label}?`}
        description={`This ${label} will remain visible in the expense history as deleted.`}
      >
        <div className='flex flex-col gap-4'>
          {error && <p role='alert' className='text-sm text-destructive'>{error}</p>}
          <p className='text-sm text-muted-foreground'>
            Its previous details will be retained for expense members to review.
          </p>
          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              className='min-h-11'
              disabled={isDeleting}
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              className='min-h-11'
              disabled={isDeleting}
              onClick={() => void confirmDelete()}
            >
              {isDeleting ? 'Deleting…' : `Delete ${label}`}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
