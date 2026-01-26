'use client'

import { memo, useCallback, useState } from 'react'
import ExpenseFormComponent from '@/components/ExpenseForm/ExpenseForm'
import useExpenseSave from '@/hooks/useExpenseSave/useExpenseSave'
import mapCurrencyNameToCode from '@/lib/utils/currency/mapCurrencyNameToCode'

function ExpenseForm() {
  const [currency, setCurrency] = useState('')
  const [name, setName] = useState('')

  const { saveExpense } = useExpenseSave()

  const handleCurrencyChange = useCallback((currency: string) => {
    setCurrency(currency)
  }, [])

  const handleNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setName(evt.target.value)
  }, [])

  const handleSubmit = useCallback(() => {
    saveExpense({
      name,
      currency: mapCurrencyNameToCode(currency),
    })
  }, [currency, name, saveExpense])

  return (
    <ExpenseFormComponent
      onCurrencyChange={handleCurrencyChange}
      onNameChange={handleNameChange}
      onSubmit={handleSubmit}
    />
  )
}

export default memo(ExpenseForm)
