import { memo } from 'react'
import { Combobox } from '../ui/combobox'
import { currencyCodes, currencyNames } from '@/constants/currency'

export interface ICurrencySelectProps {
  className?: string
  helperText?: string
  hasError?: boolean
  onChange: (currency: string) => void
}

function CurrencySelect({
  className,
  helperText,
  hasError,
  onChange,
}: ICurrencySelectProps) {
  return (
    <Combobox
      className={className}
      emptyLabel='No currencies found'
      items={currencyNames}
      itemShortcuts={currencyCodes}
      label='Currency'
      placeholder='Select a currency...'
      separatorIndices={[4]}
      helperText={helperText}
      hasError={hasError}
      onChange={onChange}
    />
  )
}

export default memo(CurrencySelect)
