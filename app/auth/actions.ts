'use server'

import { authClient } from '@/lib/auth/client'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email?.trim() || !EMAIL_REGEX.test(email)) {
    return { error: 'Valid email is required.' }
  }

  if (!password) {
    return { error: 'Password is required.' }
  }

  const { error } = await authClient.signIn.email({
    email: email.trim(),
    password,
  })

  if (error) {
    return { error: error.message || 'Failed to sign in. Try again.' }
  }

  redirect('/')
}

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name?.trim()) {
    return { error: 'Name is required.' }
  }

  if (!email?.trim() || !EMAIL_REGEX.test(email)) {
    return { error: 'Valid email is required.' }
  }

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  try {
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    })

    if (error) {
      return { error: error.message || 'Failed to create account. Try again.' }
    }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to create account. Try again.' }
  }

  redirect('/')
}

export async function signInWithGoogle(formData?: FormData): Promise<void> {
  const headersList = await headers()
  const host =
    headersList.get('x-forwarded-host') ?? headersList.get('host') ?? 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') ?? 'http'
  const callbackURL = `${protocol}://${host}/`

  const { data, error } = await authClient.signIn.social({
    provider: 'google',
    callbackURL,
  })

  const errorRedirect =
    (formData?.get('errorRedirect') as string | null) ?? '/auth/sign-in'

  if (error) {
    redirect(`${errorRedirect}?error=${encodeURIComponent(error.message ?? 'Unknown error')}`)
  }

  if (data?.url && data?.redirect) {
    redirect(data.url)
  }

  redirect('/auth/sign-in?error=' + encodeURIComponent('Failed to initiate sign in'))
}
