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
  required?: boolean
  value?: string
  onItemSelect?: (value: string) => void
}

function Select({ className, id, items, name, placeholder, onItemSelect, ...props }: ISelectProps) {
  return (
    <SelectComponent {...props} name={name} onValueChange={onItemSelect}>
      <SelectTrigger id={id} className={cn(className, "border-(--text-border-light) rounded-xl px-3 py-2 w-full")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-(--text-border-light)">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
            {item.checked && <BadgeCheck />}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectComponent>
  )
}

export default memo(Select)
