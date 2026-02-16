import { auth } from '@/lib/auth/server'

const authMiddleware = auth.middleware({
  loginUrl: '/auth/sign-in',
})

export default authMiddleware

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
