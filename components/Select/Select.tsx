import { memo } from 'react'
import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils';
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import Label from '@/components/typography/Label/Label'

export interface ISelectItem {
  checked?: boolean
  label: string
  value: string
}

export interface ISelectProps {
  className?: string
  id?: string
  items: ISelectItem[]
  name: string
  placeholder: string
  label?: string
  helperText?: string
  hasError?: boolean
  required?: boolean
  value?: string
  onItemSelect?: (value: string) => void
}

function Select({
  className,
  id,
  items,
  name,
  placeholder,
  label,
  helperText,
  hasError,
  onItemSelect,
  ...props
}: ISelectProps) {
  const triggerId = id ?? name

  return (
    <div className='flex flex-col'>
      {label && <Label id={triggerId}>{label}</Label>}
      <SelectComponent {...props} name={name} onValueChange={onItemSelect}>
        <SelectTrigger
          id={triggerId}
          aria-invalid={hasError}
          aria-describedby={helperText ? `${triggerId}-helper` : undefined}
          className={cn(className, hasError && 'border-destructive')}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
              {item.checked && <BadgeCheck />}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectComponent>
      {helperText && <p id={`${triggerId}-helper`} className='mt-1 text-sm text-destructive'>{helperText}</p>}
    </div>
  )
}

export default memo(Select)
