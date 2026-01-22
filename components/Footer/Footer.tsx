import { memo } from 'react'
import FooterButton from '@/components/FooterButton/FooterButton'

export interface IFooter {
  activePage: '/' | '/profile'
}

function Footer ({
  activePage,
}: IFooter) {
  return (
    <footer className='flex justify-center items-center gap-2 w-full p-3'>
      <FooterButton path='/' isActive={activePage === '/'} iconName='dollar' />
      <FooterButton path='/profile' isActive={activePage === '/profile'} iconName='user' />
    </footer>
  )
}

export default memo(Footer)
