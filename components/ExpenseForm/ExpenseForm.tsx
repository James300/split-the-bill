'use client'

import { memo } from 'react'
import CurrencySelect from '@/components/CurrencySelect/CurrencySelect'

function ExpenseForm() {
  const handleChange = (currency: string) => {
    console.log(currency)
  }

  return (
    <div>
      <CurrencySelect onChange={handleChange} />
    </div>
  )
}

export default memo(ExpenseForm)
