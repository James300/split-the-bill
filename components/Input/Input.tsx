import { memo } from 'react'
import Label from '@/components/typography/Label/Label'
import { Input as InputComponent } from '../ui/input'

export interface IInputProps extends React.ComponentProps<'input'> {
  id: string
  label?: string
}

function Input({ className, id, label, ...props }: IInputProps) {
  const cn = `${className} border-border text-foreground rounded-xl p-5`

  return (
    <>
      {label && <Label id={id}>{label}</Label>}
      <InputComponent id={id} className={cn} {...props} />
    </>
  )
}

export default memo(Input)
