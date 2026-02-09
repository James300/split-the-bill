import { auth } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  // Users can only view their own profile
  if (session.user.id !== id) {
    redirect('/')
  }

  const user = session.user

  return (
    <div className="flex flex-col gap-6 px-4 py-8 max-w-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Your account information
        </p>
      </div>

      <div className="rounded-lg border p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'Profile'}
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-medium">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <p className="font-medium">{user.name || 'No name set'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
