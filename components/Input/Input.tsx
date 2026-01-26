import { memo } from 'react'
import { cn } from '@/lib/utils'
import Label from '@/components/typography/Label/Label'
import { Input as InputComponent } from '../ui/input'

export interface IInputProps extends React.ComponentProps<'input'> {
  id: string
  label?: string
  helperText?: string
  hasError?: boolean
}

function Input({ className, id, label, helperText, hasError, ...props }: IInputProps) {
  const cnClasses = cn(
    'border-border text-foreground rounded-xl p-5',
    hasError && 'border-red-500',
    className
  )

  return (
    <>
      {label && <Label id={id}>{label}</Label>}
      <InputComponent id={id} className={cnClasses} {...props} />
      {helperText && (
        <p className='text-red-500 text-sm mt-1'>{helperText}</p>
      )}
    </>
  )
}

export default memo(Input)
