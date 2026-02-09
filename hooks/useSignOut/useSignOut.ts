import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/client'

export function useSignOut() {
  const router = useRouter()

  const signOut = useCallback(async () => {
    await authClient.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }, [router])

  return { signOut }
}
