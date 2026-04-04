import { useCallback, useState } from 'react'
import mapCurrencyNameToCode from '@/lib/utils/currency/mapCurrencyNameToCode'

interface ValidationErrors {
  name?: string
  currency?: string
}

export function useExpenseFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validate = useCallback((name: string, currency: string): boolean => {
    const newErrors: ValidationErrors = {}

    if (!name || name.trim().length === 0) {
      newErrors.name = 'Expense name is required'
    } else if (name.length > 255) {
      newErrors.name = 'Expense name must be 255 characters or less'
    }

    const currencyCode = mapCurrencyNameToCode(currency)
    if (!currency || !currencyCode) {
      newErrors.currency = 'Currency is required'
    } else if (currencyCode.length !== 3) {
      newErrors.currency = 'Invalid currency code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [])

  const clearError = useCallback((field: keyof ValidationErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
  }
}
