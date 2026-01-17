import { memo } from 'react'
import {
  Dialog as DialogComponent,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface IDialogProps {
  className?: string
  children?: React.ReactNode
  description?: string
  isFullscreen?: boolean
  open?: boolean
  title?: string
  onOpenChange?: (open: boolean) => void
}

function Dialog ({
  children,
  description,
  isFullscreen,
  open,
  title,
  onOpenChange,
  ...props
}: IDialogProps) {
  const showHeader = title || description

  return (
    <DialogComponent open={open} onOpenChange={onOpenChange}>
      <DialogTrigger></DialogTrigger>
      <DialogContent {...props}>
        {showHeader && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </DialogComponent>
  )
}

export default memo(Dialog)
