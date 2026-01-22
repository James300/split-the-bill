import { memo } from 'react'
import Link from 'next/link'
import { CircleDollarSign, CircleUserRound } from 'lucide-react'
import IconButton, { IIConButton } from '@/components//IconButton/IconButton'
import { cn } from '@/lib/utils'

export interface IFooterButton extends Omit<IIConButton, 'children'> {
  isActive: boolean
  iconName: string
  path: '/' | '/profile'
}

function FooterButtonIcon({ iconName }: { iconName: string }) {
  if (iconName === 'dollar') {
    return <CircleDollarSign />
  } else if (iconName === 'user') {
    return <CircleUserRound />
  }

  return null
}

function FooterButton ({
  isActive,
  iconName,
  path,
}: IFooterButton) {
  const activeClassName = isActive ? 'bg-primary text-primary-foreground hover:bg-primary-hover' : ''

  return (
    <Link className='flex justify-center items-center w-full' href={path}>
      <IconButton className={cn('w-full', activeClassName)}>
        <FooterButtonIcon iconName={iconName} />
      </IconButton>
    </Link>
  )
}

export default memo(FooterButton)
