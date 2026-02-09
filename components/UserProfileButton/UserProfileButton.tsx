'use client'

import Link from 'next/link'
import { authSession } from '@/lib/auth/server-session'
import { useSignOut } from '@/hooks/useSignOut'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'

export function UserProfileButton() {
  const { data: session, isPending } = authSession.useSession()
  const { signOut } = useSignOut()

  if (isPending || !session?.user) {
    return null
  }

  const user = session.user
  const displayName = user.name || user.email || 'User'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          {user.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}`} className="flex items-center gap-2">
            <User className="size-4" />
            My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          variant="destructive"
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
