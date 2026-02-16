import { auth } from '@/lib/auth/server'

const authMiddleware = auth.middleware({
  loginUrl: '/auth/sign-in',
})

export default authMiddleware

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth API routes)
     * - auth (sign-in page and callbacks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
