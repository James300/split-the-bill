import { memo } from 'react'

export interface IOverlayProps {
  isOpen: boolean
  title: string
}

function Overlay({ isOpen, title }: IOverlayProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className='absolute inset-0 bg-stone-500/20 flex items-center justify-center'>
      <div className='text-foreground'>
        {title}
      </div>
    </div>
  )
}

export default memo(Overlay)
