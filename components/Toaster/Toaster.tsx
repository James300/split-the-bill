'use client'

import { memo, useEffect } from 'react'
import { Toaster as SonnerToaster, toast } from 'sonner'

function Toaster({ error, saveMessage }: { error?: string | null, saveMessage?: string | null }) {
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    if (saveMessage) {
      toast.success(saveMessage)
    }
  }, [saveMessage])

  return (
    <SonnerToaster expand position='top-right' richColors />
  )
}

export default memo(Toaster)
