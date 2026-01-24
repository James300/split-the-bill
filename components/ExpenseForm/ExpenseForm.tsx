'use client'

import { memo } from 'react'
import CurrencySelect from '@/components/CurrencySelect/CurrencySelect'
import Input from '../Input'

function ExpenseForm() {
  const handleChange = (currency: string) => {
    console.log(currency)
  }

  return (
    <div className='flex flex-col'>
      <Input className='mb-4' id='expense-name' label='Name' placeholder='Give your expense a name...' />
      <CurrencySelect onChange={handleChange} />
    </div>
  )
}

export default memo(ExpenseForm)
