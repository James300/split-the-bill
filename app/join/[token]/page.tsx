import type { Metadata } from 'next'
import Page from '@/components/Page/Page'
import JoinExpense from '@/components/JoinExpense/JoinExpense'
import { auth } from '@/lib/auth/server'
import { getExpenseInvitationPreview } from '@/lib/services/expense-invitation.service'

export const metadata: Metadata = {
  title: 'Join a shared expense',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}
export const dynamic = 'force-dynamic'

export default async function JoinExpensePage({ params }: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const preview = await getExpenseInvitationPreview(token)

  if (!preview) {
    return (
      <Page title='Invitation unavailable' size='sm'>
        <p role='status' className='text-sm text-muted-foreground'>
          This invitation is invalid, expired, or was revoked. Ask an expense member for a new link.
        </p>
      </Page>
    )
  }

  const session = await auth.getSession()
  const currentUserId = session?.data?.user?.id ?? null
  const isMember = currentUserId !== null && preview.members.some(
    (member) => member.id === currentUserId,
  )

  return (
    <Page title='Join expense' size='sm'>
      <div className='flex flex-col gap-2'>
        <p className='text-sm text-muted-foreground'>You were invited to join</p>
        <h2 className='text-2xl font-semibold'>{preview.expense_name}</h2>
      </div>
      <JoinExpense
        expenseId={preview.expense_id}
        token={token}
        isAuthenticated={currentUserId !== null}
        isMember={isMember}
        members={preview.members.map(({ name }) => ({ name }))}
      />
    </Page>
  )
}
