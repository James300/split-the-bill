import { memo } from 'react'
import { Input as InputComponent } from '../ui/input'

export interface IInputProps extends React.ComponentProps<'input'> {}

function Input({ className, ...props }: IInputProps) {
  const cn = `${className} border-border text-foreground rounded-xl p-5`

  return <InputComponent className={cn} {...props} />
}

export default memo(Input)
