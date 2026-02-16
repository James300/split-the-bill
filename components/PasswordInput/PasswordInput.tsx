'use client'

import { memo, useCallback, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import IconButton from '@/components/IconButton/IconButton'
import Input from '@/components/Input'

type PasswordInputProps = React.ComponentProps<typeof Input>

function ShowHideButton({
  shouldShow,
  onClick,
}: {
  shouldShow?: boolean
  onClick?: () => void
}) {
  return (
    <IconButton
      type="button"
      aria-label={shouldShow ? 'Hide password' : 'Show password'}
      onClick={onClick}
      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-transparent"
    >
      {shouldShow ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </IconButton>
  )
}

function PasswordInput({
  className,
  label,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const onShowToggle = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  return (
    <Input
      label={label}
      suffixNode={<ShowHideButton shouldShow={showPassword} onClick={onShowToggle} />}
      type={showPassword ? 'text' : 'password'}
      {...props}
    />
  )
}

export default memo(PasswordInput)
