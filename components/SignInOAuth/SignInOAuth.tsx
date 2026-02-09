import { memo } from 'react'
import { signInWithGoogle } from '@/app/auth/actions'
import { GoogleAuthButton } from '@/components/GoogleAuthButton'

function SignInOAuth() {
  return (
    <>
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
    </>
  )
}

export default memo(SignInOAuth)
