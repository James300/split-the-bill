'use client'

import { memo } from 'react'
import Button from '@/components/Button'
import CurrencySelect from '@/components/CurrencySelect/CurrencySelect'
import Input from '@/components/Input'

export interface IExpenseFormProps {
  onCurrencyChange: (currency: string) => void
  onNameChange: (evt: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: () => void
  validationErrors?: {
    name?: string
    currency?: string
  }
  isSubmitting?: boolean
}

function ExpenseForm({
  onCurrencyChange,
  onNameChange,
  onSubmit,
  validationErrors = {},
  isSubmitting = false,
}: IExpenseFormProps) {
  return (
    <div className='flex flex-col'>
      <div className='mb-4'>
        <Input
          id='expense-name' 
          label='Name' 
          placeholder='Give your expense a name...' 
          helperText={validationErrors.name}
          hasError={!!validationErrors.name}
          onChange={onNameChange} 
        />
      </div>
      <div>
        <CurrencySelect 
          helperText={validationErrors.currency}
          hasError={!!validationErrors.currency}
          onChange={onCurrencyChange} 
        />
      </div>
      <Button 
        className='mt-8' 
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Expense'}
      </Button>
    </div>
  )
}

export default memo(ExpenseForm)
