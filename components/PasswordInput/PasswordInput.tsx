import { memo } from 'react'
import Input, { IInputProps } from '../Input'

function PasswordInput(props: IInputProps) {
  return (
    <Input
      name="password"
      placeholder="Password"
      type="password"
      {...props}
    />
  )
}

export default memo(PasswordInput)
