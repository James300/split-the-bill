'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import ExpenseFormComponent from '@/components/ExpenseForm/ExpenseForm'
import useExpenseSave from '@/hooks/useExpenseSave/useExpenseSave'
import { useExpenseFormValidation } from '@/hooks/useExpenseFormValidation/useExpenseFormValidation'
import mapCurrencyNameToCode from '@/lib/utils/currency/mapCurrencyNameToCode'

function ExpenseForm() {
  const [currency, setCurrency] = useState('')
  const [name, setName] = useState('')
  const { errors, validate, clearError, clearAll } = useExpenseFormValidation()
  const { saveExpense, isSaving, error } = useExpenseSave()

  const handleCurrencyChange = useCallback((currency: string) => {
    setCurrency(currency)
    if (errors.currency) {
      clearError('currency')
    }
  }, [errors.currency, clearError])

  const handleNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setName(evt.target.value)
    if (errors.name) {
      clearError('name')
    }
  }, [errors.name, clearError])

  const handleSubmit = useCallback(() => {
    clearAll()

    if (!validate(name, currency)) {
      return
    }

    saveExpense({
      name: name.trim(),
      currency: mapCurrencyNameToCode(currency),
    })
  }, [currency, name, saveExpense, validate, clearAll])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  return (
    <ExpenseFormComponent
      onCurrencyChange={handleCurrencyChange}
      onNameChange={handleNameChange}
      onSubmit={handleSubmit}
      validationErrors={errors}
      isSubmitting={isSaving}
    />
  )
}

export default memo(ExpenseForm)
