import Link from 'next/link'
import SignUpContainer from '@/containers/SignUp'

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function SignUpPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center w-full gap-8">
        <h1 className="text-2xl font-bold">Sign up</h1>
        {error && (
          <p className="text-sm text-destructive text-center">
            {decodeURIComponent(error)}
          </p>
        )}
        <SignUpContainer />
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
