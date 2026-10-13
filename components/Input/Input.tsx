import { memo } from 'react'
import { cn } from '@/lib/utils'
import Label from '@/components/typography/Label/Label'
import { Input as InputComponent } from '../ui/input'

export interface IInputProps extends React.ComponentProps<'input'> {
  id: string
  label?: string
  helperText?: string
  hasError?: boolean
  suffixNode?: React.ReactNode
}

function Input({ className, id, label, helperText, hasError, suffixNode, ...props }: IInputProps) {
  const cnClasses = cn(
    hasError && 'border-destructive',
    suffixNode && 'pr-10',
    className
  )

  return (
    <div className='flex flex-col'>
      {label && <Label id={id}>{label}</Label>}
      <div className='relative'>
        <InputComponent
          id={id}
          className={cnClasses}
          {...props}
          aria-invalid={hasError || props['aria-invalid']}
          aria-describedby={props['aria-describedby'] ?? (helperText ? `${id}-helper` : undefined)}
        />
        {suffixNode}
      </div>
      {helperText && (
        <p id={`${id}-helper`} className='mt-1 text-sm text-destructive'>{helperText}</p>
      )}
    </div>
  )
}

export default memo(Input)
