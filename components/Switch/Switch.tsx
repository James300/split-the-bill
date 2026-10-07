import { memo, useCallback } from 'react'
import { Switch as SwitchComponent } from '../ui/switch'

export interface ISwitchProps {
  checked?: boolean
  id?: string
  label: string
  onClick?: (label: string) => void
  onCheckedChange?: (checked: boolean) => void
}

function Switch({ checked, id, label, onClick, onCheckedChange }: ISwitchProps) {
  const switchId = id ?? label
  const handleClick = useCallback((nextChecked: boolean) => {
    onClick?.(label)
    onCheckedChange?.(nextChecked)
  }, [label, onClick, onCheckedChange])

  return (
    <div className="flex items-center space-x-3">
      <SwitchComponent
        className="
          border-3
          border-(--text-dark)
          cursor-pointer
          [&>span]:size-2.5
          data-[state=unchecked]:bg-(--background-primary)
          data-[state=unchecked]:[&>span]:translate-x-0.5
          data-[state=unchecked]:[&>span]:bg-(--text-dark)
          data-[state=checked]:[&>span]:translate-x-4
          data-[state=checked]:[&>span]:bg-(--background-primary)
          data-[state=checked]:bg-(--text-dark)
        "
        checked={checked}
        id={switchId}
        onCheckedChange={handleClick}
      />
      <label
        className="cursor-pointer text-sm text-(--text-dark)"
        htmlFor={switchId}
      >
        {label}
      </label>
    </div>
  )
}

export default memo(Switch)
