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
  showCloseButton?: boolean
  title?: string
  trigger?: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

function Dialog ({
  children,
  description,
  isFullscreen,
  open,
  showCloseButton = true,
  title,
  trigger,
  onOpenChange,
  ...props
}: IDialogProps) {
  const showHeader = title || description

  return (
    <DialogComponent open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent {...props} showCloseButton={showCloseButton}>
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
