'use client'

import { useRef } from 'react'
import { CalendarDays } from 'lucide-react'
import IconButton from '@/components/IconButton/IconButton'
import Input from '@/components/Input'

export default function DateInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openDatePicker = () => {
    const input = inputRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    } else {
      input.focus()
    }
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      label={label}
      type='date'
      value={value}
      className='date-input pr-12'
      onClick={openDatePicker}
      onChange={(event) => onChange(event.currentTarget.value)}
      suffixNode={(
        <IconButton
          type='button'
          aria-label='Open date picker'
          onClick={openDatePicker}
          className='absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0'
        >
          <CalendarDays aria-hidden='true' size={17} />
        </IconButton>
      )}
    />
  )
}
