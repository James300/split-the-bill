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
    <label htmlFor={id} className='text-label text-sm font-medium mb-1'>{children}</label>
  )
}

export default memo(Label)
