'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import Input from '@/components/Input'
import PasswordInput from '@/components/PasswordInput'

export type AuthFormMode = 'sign-in' | 'sign-up'

export type AuthFormState = { error: string } | null

type AuthFormProps = {
  mode: AuthFormMode
  action: (
    prevState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction] = useActionState(action, null)

  const submitLabel = mode === 'sign-in' ? 'Sign in' : 'Sign up'
  const showNameField = mode === 'sign-up'

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {showNameField && (
        <Input
          id="name"
          name="name"
          label="Name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
        />
      )}
      <Input
        id="email"
        name="email"
        label='Email'
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <PasswordInput
        id="password"
        label='Password'
        name="password"
        placeholder={mode === 'sign-up' ? 'At least 8 characters' : undefined}
        autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
        required
      />
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit">{submitLabel}</Button>
    </form>
  )
}
