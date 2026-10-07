import { AuthView } from "@neondatabase/auth-ui"
import { authViewPaths } from "@neondatabase/auth-ui/server"

export const dynamicParams = false

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }))
}

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string }>
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { path } = await params
  const { returnTo } = await searchParams
  const redirectTo = returnTo && /^\/join\/[A-Za-z0-9_-]{43}$/.test(returnTo)
    ? returnTo
    : '/'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <AuthView className='max-w-[500px]' path={path} redirectTo={redirectTo} />
    </div>
  )
}
