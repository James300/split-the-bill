'use client'

import { useOnVisible } from '@/hooks/useOnVisible/useOnVisible'

export default function ExpensePaymentReadBoundary({
  label,
  observesUnreadActivity,
  onVisible,
  actionLabel,
  actionExpanded = false,
  onAction,
}: {
  label: string
  observesUnreadActivity: boolean
  onVisible: () => void
  actionLabel?: string
  actionExpanded?: boolean
  onAction?: () => void
}) {
  const ref = useOnVisible<HTMLLIElement>(observesUnreadActivity, onVisible)

  return (
    <li
      ref={ref}
      role={actionLabel && onAction ? 'group' : 'separator'}
      aria-label={label}
      className='flex items-center gap-3 py-1 text-xs font-medium text-muted-foreground'
    >
      <span aria-hidden='true' className='h-px flex-1 bg-border' />
      <span>{label}</span>
      {actionLabel && onAction && (
        <button
          type='button'
          className='min-h-11 shrink-0 rounded-md px-2 text-primary underline underline-offset-2 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          aria-expanded={actionExpanded}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
      <span aria-hidden='true' className='h-px flex-1 bg-border' />
    </li>
  )
}
