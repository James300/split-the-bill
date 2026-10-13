'use client'

import React, { useCallback, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import Separator from '../Separator'
import Label from '../typography/Label/Label'

export interface IComboboxProps {
  className?: string
  id?: string
  emptyLabel: string
  items: string[]
  itemShortcuts?: string[]
  label?: string
  placeholder?: string
  separatorIndices?: number[]
  helperText?: string
  hasError?: boolean
  onChange: (item: string) => void
}

export function Combobox({
  className,
  id,
  emptyLabel,
  items,
  itemShortcuts,
  label,
  placeholder,
  separatorIndices,
  helperText,
  hasError,
  onChange,
}: IComboboxProps) {
  const controlId = id ?? 'combobox'
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const handleChange = useCallback(
    (value: string) => {
      setOpen(false)
      setValue(value)
      onChange(value)
    },
    [onChange]
  )

  return (
    <div className='flex flex-col'>
      <Popover open={open} onOpenChange={setOpen}>
      {label && (
        <Label id={controlId}>
          {label}
        </Label>
      )}
      <PopoverTrigger asChild>
        <Button
          id={controlId}
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-invalid={hasError}
          aria-describedby={helperText ? `${controlId}-helper` : undefined}
          className={cn(
            'h-11 w-full justify-between rounded-xl px-3 py-2 text-sm text-foreground',
            className,
            hasError && 'border-destructive'
          )}
        >
          {!value && placeholder && <div className='text-muted-foreground'>{placeholder}</div>}
          {value ? value : undefined}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full h-[400px] p-0'>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{emptyLabel}</CommandEmpty>
          <CommandGroup className='overflow-auto'>
            {items.map((item, index) => {
              const itemShortcut = itemShortcuts?.[index]

              return (
                <React.Fragment key={item}>
                  {separatorIndices?.includes(index) && (
                    <Separator className='my-1' />
                  )}
                  <CommandItem
                    value={item}
                    onSelect={handleChange}
                  >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === item
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {item}
                    {itemShortcut && (
                      <CommandShortcut className='ml-auto'>
                        {itemShortcut}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                </React.Fragment>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
      {helperText && (
        <p id={`${controlId}-helper`} className='mt-1 text-sm text-destructive'>{helperText}</p>
      )}
      </Popover>
    </div>
  )
}
