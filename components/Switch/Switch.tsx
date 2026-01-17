import { memo, useCallback } from 'react'
import { Switch as SwitchComponent } from '../ui/switch'

export interface ISwitchProps {
  checked?: boolean
  label: string
  onClick?: (label: string) => void
}

function Switch({ checked, label, onClick }: ISwitchProps) {
  const handleClick = useCallback(() => {
    onClick?.(label)
  }, [label, onClick])

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
        id={label}
        onCheckedChange={handleClick}
      />
      <label
        className="cursor-pointer text-sm text-(--text-dark)"
        htmlFor={label}
      >
        {label}
      </label>
    </div>
  )
}

export default memo(Switch)
