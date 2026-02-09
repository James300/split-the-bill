'use client'

import { useFormStatus } from 'react-dom'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

type GoogleAuthButtonProps = {
  action: 'sign-in' | 'sign-up'
}

export function GoogleAuthButton({ action }: GoogleAuthButtonProps) {
  const { pending } = useFormStatus()

  const label =
    action === 'sign-in'
      ? pending
        ? 'Signing in...'
        : 'Sign in with Google'
      : pending
        ? 'Signing up...'
        : 'Sign up with Google'

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="w-full"
    >
      <Image
        src="/google-logo.svg"
        alt="Google Logo"
        width={16}
        height={16}
        className="size-4"
      />
      {label}
    </Button>
  )
}
