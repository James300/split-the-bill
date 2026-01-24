import { memo } from 'react'
import { Combobox } from '../ui/combobox'
import { currencyCodes, currencyNames } from '@/constants/currency'

export interface ICurrencySelectProps {
  className?: string
  onChange: (currency: string) => void
}

function CurrencySelect({
  className,
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
      onChange={onChange}
    />
  )
}

export default memo(CurrencySelect)
