'use client'

import { memo, useCallback, useState } from 'react'
import ExpenseFormComponent from '@/components/ExpenseForm/ExpenseForm'

function ExpenseForm() {
  const [currency, setCurrency] = useState('')
  const [name, setName] = useState('')

  const handleCurrencyChange = useCallback((currency: string) => {
    setCurrency(currency)
  }, [])

  const handleNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setName(evt.target.value)
  }, [])

  const handleSubmit = useCallback(() => {
    // todo: submit data to the BE
  }, [currency, name])

  return (
    <ExpenseFormComponent
      onCurrencyChange={handleCurrencyChange}
      onNameChange={handleNameChange}
      onSubmit={handleSubmit}
    />
  )
}

export default memo(ExpenseForm)
