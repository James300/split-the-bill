import { createNeonAuth } from '@neondatabase/auth/next/server'

const ONE_HOUR = 60 * 60;

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    sessionDataTtl: ONE_HOUR,
  },
})
