import { memo } from 'react';
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'destructive'

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant
}

function Button({ children, onClick, variant = 'default', className, ...props }: IButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'rounded-xl cursor-pointer px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'destructive'
          ? 'bg-destructive text-destructive-foreground hover:bg-destructive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive'
          : 'bg-primary text-primary-foreground hover:bg-primary-hover',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default memo(Button);
