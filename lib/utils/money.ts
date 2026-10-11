export const MAX_MINOR_CURRENCY_AMOUNT = 2_147_483_647

export function getCurrencyFractionDigits(currency: string): number {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).resolvedOptions().maximumFractionDigits ?? 2
}

export function parseCurrencyAmountToMinorUnits(
  value: string,
  currency: string,
): number | null {
  let fractionDigits: number
  try {
    fractionDigits = getCurrencyFractionDigits(currency)
  } catch {
    return null
  }

  const normalized = value.trim().replace(/^\./, '0.')
  const pattern = fractionDigits === 0
    ? /^\d+$/
    : new RegExp(`^\\d+(?:\\.\\d{1,${fractionDigits}})?$`)
  if (!pattern.test(normalized)) return null

  const [wholePart, fractionPart = ''] = normalized.split('.')
  const scale = 10 ** fractionDigits
  const whole = Number(wholePart)
  const fraction = Number(fractionPart.padEnd(fractionDigits, '0') || '0')
  if (!Number.isSafeInteger(whole)) return null
  const minorUnits = whole * scale + fraction

  if (!Number.isSafeInteger(minorUnits) || minorUnits <= 0 || minorUnits > MAX_MINOR_CURRENCY_AMOUNT) {
    return null
  }
  return minorUnits
}

export function formatMinorCurrencyAmount(amount: number, currency: string): string {
  const fractionDigits = getCurrencyFractionDigits(currency)
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount / (10 ** fractionDigits))
}

export function sortMemberIds(ids: string[]): string[] {
  return [...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}
