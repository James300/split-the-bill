import { memo } from 'react'
import { cn } from '@/lib/utils'

function Separator({
  className,
}: React.ComponentProps<'hr'> & {
  className?: string
}) {
  return <hr className={cn("w-full", className)} />
}

export default memo(Separator)
