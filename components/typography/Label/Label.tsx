import { memo } from 'react'

export interface ILabelProps {
  children: React.ReactNode
  id: string
}

function Label({
  children,
  id,
}: ILabelProps) {
  return (
    <label htmlFor={id} className='mb-1.5 block text-label text-sm leading-5 font-medium'>{children}</label>
  )
}

export default memo(Label)
