import { memo } from 'react'
import {
  RadioGroup as RadioGroupComponent,
  RadioGroupItem,
} from '../ui/radio-group'

export interface IRadioGroupProps {
  checkedItem?: string
  className?: string
  disabled?: boolean
  items?: string[]
  name?: string
  onClick?: (label: string) => void
  onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void
}

function RadioGroup({
  checkedItem,
  className,
  disabled,
  items,
  name,
  onClick,
  onChange,
}: IRadioGroupProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <RadioGroupComponent
      className={className}
      disabled={disabled}
      name={name}
      value={checkedItem}
      onValueChange={onClick}
      onChange={onChange}
    >
      {items.map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <RadioGroupItem
            className="
              text-primary
              [&>span>svg]:fill-primary
              [&>span>svg]:size-2
              border-1
              border-primary
            "
            id={item}
            value={item}
          />
          <label htmlFor={item}>{item}</label>
        </div>
      ))}
    </RadioGroupComponent>
  )
}

export default memo(RadioGroup)
