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
  emptyLabel: string
  items: string[]
  itemShortcuts?: string[]
  label?: string
  placeholder?: string
  separatorIndices?: number[]
  onChange: (item: string) => void
}

export function Combobox({
  className,
  emptyLabel,
  items,
  itemShortcuts,
  label,
  placeholder,
  separatorIndices,
  onChange,
}: IComboboxProps) {
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
    <Popover open={open} onOpenChange={setOpen}>
      {label && (
        <Label id='combobox-label'>
          {label}
        </Label>
      )}
      <PopoverTrigger asChild>
        <Button
          id='combobox-label'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between text-md p-5! rounded-xl'
        >
          {!value && placeholder && <div className='text-placeholder'>{placeholder}</div>}
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
    </Popover>
  )
}
