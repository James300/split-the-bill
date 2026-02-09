import { createAuthClient } from '@neondatabase/neon-js/auth';

export const authClient = createAuthClient(process.env.NEON_AUTH_BASE_URL!)
