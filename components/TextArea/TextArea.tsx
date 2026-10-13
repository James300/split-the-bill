import { memo } from 'react'
import { Textarea as TextAreaComponent } from '../ui/textarea'
import Label from '@/components/typography/Label/Label'

export interface ITextAreaProps extends Omit<React.ComponentProps<'textarea'>, 'id'> {
  id: string
  label?: string
  helperText?: string
  hasError?: boolean
}

function TextArea({ id, label, helperText, hasError, ...props }: ITextAreaProps) {
  return (
    <div className='flex flex-col'>
      {label && <Label id={id}>{label}</Label>}
      <TextAreaComponent
        id={id}
        {...props}
        aria-invalid={hasError || props['aria-invalid']}
        aria-describedby={props['aria-describedby'] ?? (helperText ? `${id}-helper` : undefined)}
      />
      {helperText && <p id={`${id}-helper`} className='mt-1 text-sm text-destructive'>{helperText}</p>}
    </div>
  )
}

export default memo(TextArea)
