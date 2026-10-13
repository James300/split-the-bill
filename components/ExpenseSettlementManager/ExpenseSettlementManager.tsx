'use client'

import { useMemo, useState } from 'react'
import Button from '@/components/Button'
import DateInput from '@/components/DateInput/DateInput'
import Input from '@/components/Input'
import Select from '@/components/Select/Select'
import type { ExpenseBalance } from '@/hooks/useExpenseBalances/useExpenseBalances'
import type { ExpenseMember } from '@/hooks/useExpenseMembers/useExpenseMembers'
import { useCreateExpenseSettlement } from '@/hooks/useCreateExpenseSettlement/useCreateExpenseSettlement'
import type { ExpenseSettlementRecord } from '@/hooks/useExpenseSettlements/useExpenseSettlements'
import { formatMinorCurrencyAmount, getCurrencyFractionDigits, parseCurrencyAmountToMinorUnits } from '@/lib/utils/money'
import { getCurrentLocalDateString } from '@/lib/utils/date'

function formatAmountInput(amount: number, currency: string) {
  const digits = getCurrencyFractionDigits(currency)
  return digits === 0
    ? String(amount)
    : (amount / (10 ** digits)).toFixed(digits)
}

export default function ExpenseSettlementManager({
  expenseId,
  members,
  balances,
  currency,
  currentUserId,
  initialSettlement,
  onCreated,
}: {
  expenseId: string
  members: ExpenseMember[]
  balances: ExpenseBalance[]
  currency: string
  currentUserId: string
  initialSettlement?: ExpenseSettlementRecord
  onCreated: () => void
}) {
  const { createSettlement, updateSettlement, isSaving, error } = useCreateExpenseSettlement()
  const otherMembers = members.filter((member) => member.id !== currentUserId)
  const [payerUserId, setPayerUserId] = useState(initialSettlement?.payerUserId ?? currentUserId)
  const [payeeUserId, setPayeeUserId] = useState(initialSettlement?.payeeUserId
    ?? (otherMembers.length === 1 ? otherMembers[0].id : ''))
  const [amountOverride, setAmountOverride] = useState<string | null>(
    initialSettlement ? formatAmountInput(initialSettlement.amount, currency) : null,
  )
  const [date, setDate] = useState(() => initialSettlement?.date ?? getCurrentLocalDateString())
  const balanceByUserId = useMemo(
    () => {
      const result = new Map(balances.map((balance) => [balance.userId, balance.amountNet]))
      if (initialSettlement) {
        result.set(
          initialSettlement.payerUserId,
          (result.get(initialSettlement.payerUserId) ?? 0) - initialSettlement.amount,
        )
        result.set(
          initialSettlement.payeeUserId,
          (result.get(initialSettlement.payeeUserId) ?? 0) + initialSettlement.amount,
        )
      }
      return result
    },
    [balances, initialSettlement],
  )

  const amountAvailable = useMemo(() => {
    const payerBalance = balanceByUserId.get(payerUserId) ?? 0
    const payeeBalance = balanceByUserId.get(payeeUserId) ?? 0
    if (payerBalance >= 0 || payeeBalance <= 0) return 0
    return Math.min(Math.abs(payerBalance), payeeBalance)
  }, [balanceByUserId, payeeUserId, payerUserId])
  const amountText = amountOverride ?? (amountAvailable > 0
    ? formatAmountInput(amountAvailable, currency)
    : '')
  const amountInMinorUnits = parseCurrencyAmountToMinorUnits(amountText, currency)
  const outstandingAfter = amountInMinorUnits === null
    ? amountAvailable
    : Math.max(0, amountAvailable - amountInMinorUnits)
  const amountError = amountText.trim() && amountInMinorUnits === null
    ? `Enter a positive amount with up to ${getCurrencyFractionDigits(currency)} decimal places.`
    : amountInMinorUnits !== null && amountInMinorUnits > amountAvailable
      ? `The outstanding amount in this direction is ${formatMinorCurrencyAmount(amountAvailable, currency)}.`
      : undefined
  const canSubmit = Boolean(
    payerUserId
    && payeeUserId
    && payerUserId !== payeeUserId
    && amountInMinorUnits
    && !amountError,
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || amountInMinorUnits === null) return
    const saved = initialSettlement
      ? await updateSettlement(initialSettlement.id, {
        payerUserId,
        payeeUserId,
        amount: amountInMinorUnits,
        date: date || null,
      })
      : await createSettlement({
        expenseId: Number(expenseId),
        payerUserId,
        payeeUserId,
        amount: amountInMinorUnits,
        date: date || null,
      })
    if (saved) onCreated()
  }

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
      <h3 className='text-base font-semibold'>
        {initialSettlement ? 'Edit settlement' : 'Settling outstanding amount owed'}
      </h3>

      <Select
        id='settlement-payer'
        label='From'
        name='settlement-payer'
        value={payerUserId}
        placeholder='Choose who is paying'
        items={members.map((member) => ({
          value: member.id,
          label: `${member.name}${member.isCurrentUser ? ' (you)' : ''}`,
        }))}
        onItemSelect={(value) => {
          setPayerUserId(value)
          if (value === payeeUserId) setPayeeUserId('')
          setAmountOverride(null)
        }}
      />

      <DateInput
        id='settlement-date'
        label='Date'
        value={date}
        onChange={setDate}
      />

      <Select
        id='settlement-payee'
        label='To'
        name='settlement-payee'
        value={payeeUserId}
        placeholder='Choose who is receiving'
        items={members.filter((member) => member.id !== payerUserId).map((member) => ({
          value: member.id,
          label: `${member.name}${member.isCurrentUser ? ' (you)' : ''}`,
        }))}
        onItemSelect={(value) => {
          setPayeeUserId(value)
          setAmountOverride(null)
        }}
      />

      <div className='flex flex-col gap-1.5'>
        <Input
          id='settlement-amount'
          label={`Amount (${currency})`}
          hasError={Boolean(amountError)}
          placeholder={getCurrencyFractionDigits(currency) === 0
            ? '0'
            : `0.${'0'.repeat(getCurrencyFractionDigits(currency))}`}
          inputMode='decimal'
          type='text'
          maxLength={20}
          value={amountText}
          required
          aria-describedby={amountError ? 'settlement-amount-error' : undefined}
          onChange={(event) => setAmountOverride(event.currentTarget.value)}
        />
        {amountAvailable > 0 && (
          <p className='text-xs text-muted-foreground'>
            Outstanding after: {formatMinorCurrencyAmount(outstandingAfter, currency)}
          </p>
        )}
        {amountError && <p id='settlement-amount-error' className='text-sm text-destructive'>{amountError}</p>}
        {payerUserId && payeeUserId && amountAvailable === 0 && (
          <p className='text-sm text-muted-foreground'>There is no outstanding amount in this direction.</p>
        )}
      </div>

      {error && <p role='alert' className='text-sm text-destructive'>{error}</p>}

      <Button type='submit' className='min-h-11 w-full' disabled={!canSubmit || isSaving}>
        {isSaving
          ? (initialSettlement ? 'Saving changes…' : 'Saving settlement…')
          : (initialSettlement ? 'Save changes' : 'Record settlement')}
      </Button>
    </form>
  )
}
