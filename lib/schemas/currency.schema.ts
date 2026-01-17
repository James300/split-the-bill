import { z } from 'zod'

export const CurrencySchema = z.string().regex(/^[A-Z]{3}$/, {
  message: 'Invalid currency code',
});
