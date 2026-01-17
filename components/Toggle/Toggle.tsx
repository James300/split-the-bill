import { memo } from 'react'
import { Toggle as ToggleComponent } from '../ui/toggle'

export interface IToggleProps {
  label: string
  pressed?: boolean
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void
}

function Toggle({ label, pressed, onClick }: IToggleProps) {
  return (
    <ToggleComponent
      className="
        border-2
        border-(--text-border-light)
        text-(--text-dark)
        rounded-full
        data-[state=on]:bg-(--text-dark)
        data-[state=on]:border-(--text-dark)
        data-[state=on]:text-(--text-light)
        cursor-pointer
        p-4
      "
      data-state={pressed ? 'on' : 'off'}
      pressed={pressed}
      variant="outline"
      value={label}
      onClick={onClick}
    >
      {label}
    </ToggleComponent>
  )
}

export default memo(Toggle)
