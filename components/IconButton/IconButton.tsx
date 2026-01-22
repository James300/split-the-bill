import { memo } from 'react'
import { cn } from '@/lib/utils'

export interface IIConButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function IconButton({
  children,
  ...props
}: IIConButton) {
  return (
    <button
      {...props}
      className={cn(`
          flex justify-center items-center
          rounded-xl cursor-pointer p-3
          bg-secondary text-secondary-foreground
          hover:bg-secondary-hover
          disabled:opacity-50 disabled:cursor-not-allowed
        `,
        props.className
      )}
    >
      {children}
    </button>
  )
}

export default memo(IconButton)
