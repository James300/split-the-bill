import { createNeonAuth } from '@neondatabase/auth/next/server'

const ONE_HOUR = 60 * 60;
const baseUrl = process.env.NEON_AUTH_BASE_URL ?? 'http://localhost:3000';
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET ?? 'dev-cookie-secret-change-me-keep-it-secret';

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sessionDataTtl: ONE_HOUR,
  },
})
