'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'

interface InviteMember {
  name: string
}

export default function JoinExpense({
  expenseId,
  token,
  isAuthenticated,
  isMember,
  members,
}: {
  expenseId: number
  token: string
  isAuthenticated: boolean
  isMember: boolean
  members: InviteMember[]
}) {
  const router = useRouter()
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const returnTo = `/join/${token}`

  const joinExpense = async () => {
    setIsJoining(true)
    setError(null)

    try {
      const response = await fetch(`/api/invitations/${token}/join`, { method: 'POST' })
      if (!response.ok) {
        setError(response.status === 404
          ? 'This invitation has expired or was revoked. Ask for a new link.'
          : 'Could not join this expense. Please try again.')
        return
      }

      const result = await response.json() as { expense_id: number }
      router.replace(`/expenses/${result.expense_id}`)
    } catch {
      setError('Could not join this expense. Check your connection and try again.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className='flex flex-col gap-5'>
      <section className='rounded-xl border p-4' aria-labelledby='invite-members-title'>
        <h2 id='invite-members-title' className='font-semibold'>People in this expense</h2>
        <ul className='mt-3 flex flex-col gap-2'>
          {members.map((member, index) => (
            <li key={`${member.name}-${index}`} className='rounded-md bg-muted px-3 py-2 text-sm'>
              {member.name}
            </li>
          ))}
        </ul>
      </section>

      {isMember ? (
        <Link
          href={`/expenses/${expenseId}`}
          className='inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-primary-foreground hover:bg-primary-hover'
        >
          Open expense
        </Link>
      ) : isAuthenticated ? (
        <Button type='button' className='min-h-11 w-full' onClick={joinExpense} disabled={isJoining}>
          {isJoining ? 'Joining…' : 'Join expense'}
        </Button>
      ) : (
        <div className='flex flex-col gap-3'>
          <p className='text-sm text-muted-foreground'>Sign in or create an account to join this expense.</p>
          <Link
            href={`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`}
            className='inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-primary-foreground hover:bg-primary-hover'
          >
            Sign in to join
          </Link>
          <Link href={`/auth/sign-up?returnTo=${encodeURIComponent(returnTo)}`} className='w-full text-center text-sm underline underline-offset-4'>
            Create an account
          </Link>
        </div>
      )}

      {error && <p role='alert' className='text-sm text-destructive'>{error}</p>}
    </div>
  )
}
