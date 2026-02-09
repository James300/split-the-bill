import { memo } from 'react'
import { AuthForm } from '@/components/AuthForm'
import { GoogleAuthButton } from '@/components/GoogleAuthButton'
import { signInWithEmail, signInWithGoogle } from '@/app/auth/actions'
import { Card } from '@/components/ui/card'

function SignIn() {
  return (
    <Card className="flex flex-col gap-6 w-full max-w-lg p-10">
      <AuthForm mode="sign-in" action={signInWithEmail} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <form action={signInWithGoogle}>
        <GoogleAuthButton action="sign-in" />
      </form>
    </Card>
  )
}

export default memo(SignIn)
