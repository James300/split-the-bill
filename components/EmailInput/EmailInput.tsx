import { memo } from 'react'
import Input, { IInputProps } from '../Input'

function EmailInput(props: IInputProps) {
  return <Input {...props} name='email' type="email" placeholder="Email" />
}

export default memo(EmailInput)
