import Link from 'next/link'
import SignInContainer from '@/containers/SignIn'

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center w-full gap-8">
        <h1 className="text-2xl font-bold">Sign in</h1>
        {error && (
          <p className="text-sm text-destructive text-center">{decodeURIComponent(error)}</p>
        )}
        <SignInContainer />
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
