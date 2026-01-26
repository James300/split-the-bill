'use client'

import { memo } from 'react'
import Button from '@/components/Button'
import CurrencySelect from '@/components/CurrencySelect/CurrencySelect'
import Input from '@/components/Input'

export interface IExpenseFormProps {
  onCurrencyChange: (currency: string) => void
  onNameChange: (evt: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: () => void
}

function ExpenseForm({
  onCurrencyChange,
  onNameChange,
  onSubmit,
}: IExpenseFormProps) {
  return (
    <div className='flex flex-col'>
      <Input className='mb-4' id='expense-name' label='Name' placeholder='Give your expense a name...' onChange={onNameChange} />
      <CurrencySelect onChange={onCurrencyChange} />
      <Button className='mt-8' onClick={onSubmit}>Save Expense</Button>
    </div>
  )
}

export default memo(ExpenseForm)
