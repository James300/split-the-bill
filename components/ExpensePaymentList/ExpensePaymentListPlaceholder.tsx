import { Skeleton } from '@/components/ui/skeleton'

export default function ExpensePaymentListPlaceholder() {
  return (
    <section aria-labelledby='expense-payments-heading' className='flex flex-col gap-3'>
      <h2 id='expense-payments-heading' className='text-lg font-semibold'>Payments</h2>
      <div role='status' aria-label='Loading expense payments' className='flex flex-col gap-3'>
        <span className='sr-only'>Loading expense payments…</span>
        {[0, 1, 2].map((item) => (
          <div key={item} aria-hidden='true' className='flex flex-col gap-3 rounded-lg border border-border p-4'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                <Skeleton className='h-5 w-2/3' />
                <Skeleton className='h-4 w-1/3' />
              </div>
              <Skeleton className='h-5 w-20' />
            </div>
            <Skeleton className='h-3 w-1/2' />
          </div>
        ))}
      </div>
    </section>
  )
}
