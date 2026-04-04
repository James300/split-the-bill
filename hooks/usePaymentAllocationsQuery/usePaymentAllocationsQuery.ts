'use client'

import { useEffect } from 'react'
import { usePaymentAllocation, usePaymentAllocations } from '@/store/PaymentStore/PaymentStore'
import { usePaymentAllocationStore } from '@/store/PaymentStore/PaymentStore'
import { useQuery } from '../useQuery/useQuery'

function usePaymentAllocationQueryHelper() {
  const { isLoading, isError, lastFetchedAt, setPaymentAllocations } = usePaymentAllocations()
  const { setLoading, setError } = usePaymentAllocationStore()
  
  const fetchPaymentAllocations = useQuery({
    isLoading,
    lastFetchedAt,
    setLoading,
    setError,
    setData: setPaymentAllocations,
    endpoint: '/api/payment-allocations'
  })
  
  return { fetchPaymentAllocations, isLoading, isError }
}

export function usePaymentAllocationsQuery() {
  const { fetchPaymentAllocations, isLoading, isError } = usePaymentAllocationQueryHelper()
  const { paymentAllocations } = usePaymentAllocations()

  useEffect(() => {
    fetchPaymentAllocations()
  }, [fetchPaymentAllocations])
  
  return { paymentAllocations, isLoading, isError }
}

export function usePaymentAllocationQuery(id: string) {
  const { fetchPaymentAllocations, isLoading, isError } = usePaymentAllocationQueryHelper()
  const paymentAllocation = usePaymentAllocation(id)

  useEffect(() => {
    fetchPaymentAllocations()
  }, [fetchPaymentAllocations])
  
  return { paymentAllocation, isLoading, isError }
}
