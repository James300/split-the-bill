'use client'

import { NeonAuthUIProvider } from '@neondatabase/auth-ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { authClient } from '@/lib/auth/client'

function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      emailOTP
      social={{ providers: ['google'] }}
      redirectTo='/expenses'
      Link={Link}
      organization={{}}
    >
      {children}
    </NeonAuthUIProvider>
  )
}

export default Providers
