'use client'

import { useOnVisible } from '@/hooks/useOnVisible/useOnVisible'

export default function ExpensePaymentReadBoundary({
  label,
  observesUnreadActivity,
  onVisible,
}: {
  label: string
  observesUnreadActivity: boolean
  onVisible: () => void
}) {
  const ref = useOnVisible<HTMLLIElement>(observesUnreadActivity, onVisible)

  return (
    <li ref={ref} role='separator' aria-label={label} className='flex items-center gap-3 py-1 text-xs font-medium text-muted-foreground'>
      <span aria-hidden='true' className='h-px flex-1 bg-border' />
      <span>{label}</span>
      <span aria-hidden='true' className='h-px flex-1 bg-border' />
    </li>
  )
}
