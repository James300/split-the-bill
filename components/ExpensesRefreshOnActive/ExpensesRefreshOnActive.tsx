'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRefreshWhenActive } from '@/hooks/useRefreshWhenActive/useRefreshWhenActive'

export default function ExpensesRefreshOnActive() {
  const router = useRouter()
  const refreshExpenses = useCallback(() => router.refresh(), [router])
  useRefreshWhenActive(refreshExpenses)

  return null
}
