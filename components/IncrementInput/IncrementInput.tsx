import { memo } from 'react'
import Button from '@/components/Button'
import Input from '@/components/Input'

import './IncrementInput.css'

export interface IIncrementInput {
  amount: number;
  disabled?: boolean;
  id: string;
  onDecrement: () => void;
  onIncrement: () => void;
}

function IncrementInput ({
  amount,
  disabled,
  id,
  onDecrement,
  onIncrement,
}: IIncrementInput) {
  return (
    <div className='increment-input flex justify-center items-center'>
      <Button disabled={disabled} onClick={onDecrement}>-</Button>
      <Input id={id} disabled value={amount} />
      <Button disabled={disabled} onClick={onIncrement}>+</Button>
    </div>
  )
}

export default memo(IncrementInput)
