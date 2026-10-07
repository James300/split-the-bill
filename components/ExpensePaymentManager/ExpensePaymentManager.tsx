'use client'

import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select/Select'
import Switch from '@/components/Switch/Switch'
import Label from '@/components/typography/Label/Label'
import type { useExpenseMembers } from '@/hooks/useExpenseMembers/useExpenseMembers'
import { useCreateExpensePayment } from '@/hooks/useCreateExpensePayment/useCreateExpensePayment'
import { formatMinorCurrencyAmount, getCurrencyFractionDigits, parseCurrencyAmountToMinorUnits, sortMemberIds } from '@/lib/utils/money'

type MembersState = ReturnType<typeof useExpenseMembers>

function splitMinorAmount(amount: number, participantIds: string[]) {
  const orderedIds = sortMemberIds(participantIds)
  const baseShare = Math.floor(amount / orderedIds.length)
  const remainder = amount % orderedIds.length
  return new Map<string, number>(orderedIds.map((id, index) => [
    id,
    baseShare + (index < remainder ? 1 : 0),
  ] as const))
}

export default function ExpensePaymentManager({
  expenseId,
  membersState,
  onCreated,
}: {
  expenseId: string
  membersState: MembersState
  onCreated: () => void
}) {
  const { members, currency, isLoading, error: membersError, reload } = membersState
  const { createPayment, isSaving, error: saveError } = useCreateExpensePayment()
  const [description, setDescription] = useState('')
  const [amountText, setAmountText] = useState('')
  const [paidByUserId, setPaidByUserId] = useState('')
  const [participantUserIds, setParticipantUserIds] = useState<string[]>([])
  const [participantsInitialized, setParticipantsInitialized] = useState(false)

  useEffect(() => {
    if (members.length === 0 || participantsInitialized) return
    setParticipantUserIds(members.map((member) => member.id))
    setPaidByUserId(members.find((member) => member.isCurrentUser)?.id ?? members[0].id)
    setParticipantsInitialized(true)
  }, [members, participantsInitialized])

  const amountInMinorUnits = useMemo(
    () => currency ? parseCurrencyAmountToMinorUnits(amountText, currency) : null,
    [amountText, currency],
  )
  const shares = useMemo(
    () => amountInMinorUnits !== null && participantUserIds.length > 0
      ? splitMinorAmount(amountInMinorUnits, participantUserIds)
      : new Map<string, number>(),
    [amountInMinorUnits, participantUserIds],
  )

  if (members.length === 0 && (isLoading || (!currency && !membersError))) {
    return <p role='status' className='text-sm text-muted-foreground'>Loading expense members…</p>
  }

  if (members.length === 0) {
    return (
      <div className='flex flex-col gap-3'>
        <p role='alert' className='text-sm text-destructive'>
          {membersError ?? 'No members are available for this expense.'}
        </p>
        {membersError && <Button type='button' className='min-h-11' onClick={reload}>Try again</Button>}
      </div>
    )
  }

  if (!currency) {
    return <p role='alert' className='text-sm text-destructive'>Could not load the expense currency. Close this dialog and try again.</p>
  }

  const fractionDigits = getCurrencyFractionDigits(currency)
  const amountError = amountText.trim() && amountInMinorUnits === null
    ? `Enter a positive amount with up to ${fractionDigits} decimal places.`
    : amountInMinorUnits !== null && participantUserIds.length > amountInMinorUnits
      ? 'The total is too small to give each person a share.'
      : undefined

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!amountInMinorUnits || !paidByUserId || participantUserIds.length === 0 || amountError) return

    const created = await createPayment({
      expenseId: Number(expenseId),
      description: description.trim(),
      amount: amountInMinorUnits,
      paidByUserId,
      participantUserIds,
    })
    if (created) onCreated()
  }

  const isFormValid = description.trim().length > 0
    && description.trim().length <= 255
    && amountInMinorUnits !== null
    && !amountError
    && paidByUserId.length > 0
    && participantUserIds.length > 0

  return (
    <form className='flex max-h-[65dvh] flex-col gap-4 overflow-y-auto pr-1' onSubmit={handleSubmit}>
      <div className='flex flex-col gap-1.5'>
        <Input
          id='payment-description'
          label='What was it for?'
          placeholder='Hotel, taxi, dinner…'
          value={description}
          maxLength={255}
          required
          autoComplete='off'
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
      </div>

      <div className='flex flex-col gap-1.5'>
        <Input
          id='payment-amount'
          label={`Amount (${currency})`}
          placeholder={fractionDigits === 0 ? '0' : `0.${'0'.repeat(fractionDigits)}`}
          inputMode='decimal'
          type='text'
          maxLength={20}
          value={amountText}
          required
          aria-describedby={amountError ? 'payment-amount-error' : undefined}
          onChange={(event) => setAmountText(event.currentTarget.value)}
        />
        {amountError && <p id='payment-amount-error' className='text-sm text-destructive'>{amountError}</p>}
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label id='payment-payer'>Paid by</Label>
        <Select
          name='payment-payer'
          value={paidByUserId}
          placeholder='Choose who paid'
          items={members.map((member) => ({
            value: member.id,
            label: `${member.name}${member.isCurrentUser ? ' (you)' : ''}`,
          }))}
          onItemSelect={setPaidByUserId}
        />
      </div>

      <fieldset className='flex flex-col gap-3'>
        <legend className='mb-1 text-sm font-medium'>Split with</legend>
        {members.map((member) => (
          <div key={member.id} className='flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border px-3 py-2'>
            <Switch
              id={`payment-participant-${member.id}`}
              label={`${member.name}${member.isCurrentUser ? ' (you)' : ''}`}
              checked={participantUserIds.includes(member.id)}
              onCheckedChange={(checked) => setParticipantUserIds((current) => (
                checked
                  ? current.includes(member.id) ? current : [...current, member.id]
                  : current.filter((id) => id !== member.id)
              ))}
            />
            {participantUserIds.includes(member.id) && shares.has(member.id) && amountInMinorUnits !== null && (
              <span className='shrink-0 text-sm text-muted-foreground'>
                {formatMinorCurrencyAmount(shares.get(member.id)!, currency)}
              </span>
            )}
          </div>
        ))}
        <p className='text-xs text-muted-foreground'>Only selected people share this payment. The split is even, with any leftover smallest units assigned by member ID.</p>
      </fieldset>

      {(membersError || saveError) && <p role='alert' className='text-sm text-destructive'>{saveError ?? membersError}</p>}

      <Button type='submit' className='min-h-11 w-full' disabled={!isFormValid || isSaving}>
        {isSaving ? 'Saving payment…' : 'Save payment'}
      </Button>
    </form>
  )
}
