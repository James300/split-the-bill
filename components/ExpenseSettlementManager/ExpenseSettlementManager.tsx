'use client'

import { useMemo, useState } from 'react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select/Select'
import Label from '@/components/typography/Label/Label'
import type { ExpenseBalance } from '@/hooks/useExpenseBalances/useExpenseBalances'
import type { ExpenseMember } from '@/hooks/useExpenseMembers/useExpenseMembers'
import { useCreateExpenseSettlement } from '@/hooks/useCreateExpenseSettlement/useCreateExpenseSettlement'
import { formatMinorCurrencyAmount, getCurrencyFractionDigits, parseCurrencyAmountToMinorUnits } from '@/lib/utils/money'

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
  onCreated,
}: {
  expenseId: string
  members: ExpenseMember[]
  balances: ExpenseBalance[]
  currency: string
  currentUserId: string
  onCreated: () => void
}) {
  const { createSettlement, isSaving, error } = useCreateExpenseSettlement()
  const otherMembers = members.filter((member) => member.id !== currentUserId)
  const [payerUserId, setPayerUserId] = useState(currentUserId)
  const [payeeUserId, setPayeeUserId] = useState(otherMembers.length === 1 ? otherMembers[0].id : '')
  const [amountOverride, setAmountOverride] = useState<string | null>(null)
  const balanceByUserId = useMemo(
    () => new Map(balances.map((balance) => [balance.userId, balance.amountNet])),
    [balances],
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
    const created = await createSettlement({
      expenseId: Number(expenseId),
      payerUserId,
      payeeUserId,
      amount: amountInMinorUnits,
    })
    if (created) onCreated()
  }

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
      <h3 className='text-base font-semibold'>Settling outstanding amount owed</h3>

      <div className='flex flex-col gap-1.5'>
        <Label id='settlement-payer'>From</Label>
        <Select
          id='settlement-payer'
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
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label id='settlement-payee'>To</Label>
        <Select
          id='settlement-payee'
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
      </div>

      <div className='flex flex-col gap-1.5'>
        <Input
          id='settlement-amount'
          label={`Amount (${currency})`}
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
            Outstanding: {formatMinorCurrencyAmount(amountAvailable, currency)}
          </p>
        )}
        {amountError && <p id='settlement-amount-error' className='text-sm text-destructive'>{amountError}</p>}
        {payerUserId && payeeUserId && amountAvailable === 0 && (
          <p className='text-sm text-muted-foreground'>There is no outstanding amount in this direction.</p>
        )}
      </div>

      {error && <p role='alert' className='text-sm text-destructive'>{error}</p>}

      <Button type='submit' className='min-h-11 w-full' disabled={!canSubmit || isSaving}>
        {isSaving ? 'Saving settlement…' : 'Record settlement'}
      </Button>
    </form>
  )
}
