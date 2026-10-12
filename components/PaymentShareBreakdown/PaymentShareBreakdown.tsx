import { formatMinorCurrencyAmount } from '@/lib/utils/money'

export interface PaymentShare {
  userId: string
  amount: number
}

export default function PaymentShareBreakdown({
  shares,
  membersById,
  currency,
  title = 'Shares',
}: {
  shares: PaymentShare[]
  membersById: Map<string, string>
  currency: string
  title?: string
}) {
  return (
    <div>
      <h4 className='mb-2 text-sm font-medium'>{title}</h4>
      {shares.length > 0 ? (
        <ul className='flex flex-col gap-1.5'>
          {shares.map((share) => (
            <li
              key={share.userId}
              className='flex items-start justify-between gap-3 text-sm'
            >
              <span className='min-w-0 break-words'>
                {membersById.get(share.userId) ?? 'Unknown member'}
              </span>
              <span className='shrink-0'>
                {formatMinorCurrencyAmount(share.amount, currency)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-sm text-muted-foreground'>No participant shares are available.</p>
      )}
    </div>
  )
}
