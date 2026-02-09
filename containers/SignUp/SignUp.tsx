import { memo } from 'react'
import { AuthForm } from '@/components/AuthForm'
import { GoogleAuthButton } from '@/components/GoogleAuthButton'
import { signUpWithEmail, signInWithGoogle } from '@/app/auth/actions'
import { Card } from '@/components/ui/card'

function SignUp() {
  return (
    <Card className="flex flex-col gap-6 w-full max-w-lg p-10">
      <AuthForm mode="sign-up" action={signUpWithEmail} />

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
        <input type="hidden" name="errorRedirect" value="/auth/sign-up" />
        <GoogleAuthButton action="sign-up" />
      </form>
    </Card>
  )
}

export default memo(SignUp)
