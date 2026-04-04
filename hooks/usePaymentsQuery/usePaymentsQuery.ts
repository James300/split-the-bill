'use client'

import { useEffect } from 'react'
import { usePayment, usePayments } from '@/store/PaymentStore/PaymentStore'
import { usePaymentStore } from '@/store/PaymentStore/PaymentStore'
import { useQuery } from '../useQuery/useQuery'

function usePaymentQueryHelper() {
  const { isLoading, isError, lastFetchedAt, setPayments } = usePayments()
  const { setLoading, setError } = usePaymentStore()
  
  const fetchPayments = useQuery({
    isLoading,
    lastFetchedAt,
    setLoading,
    setError,
    setData: setPayments,
    endpoint: '/api/payments'
  })
  
  return { fetchPayments, isLoading, isError }
}

export function usePaymentsQuery() {
  const { fetchPayments, isLoading, isError } = usePaymentQueryHelper()
  const { payments } = usePayments()

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])
  
  return { payments, isLoading, isError }
}

export function usePaymentQuery(id: string) {
  const { fetchPayments, isLoading, isError } = usePaymentQueryHelper()
  const payment = usePayment(id)

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])
  
  return { payment, isLoading, isError }
}
