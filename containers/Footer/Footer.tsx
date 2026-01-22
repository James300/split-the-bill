'use client'

import { memo } from 'react'
import { usePathname } from 'next/navigation'
import FooterComponent from '@/components/Footer/Footer'

function Footer () {
  const pathname = usePathname() as '/' | 'profile'

  return <FooterComponent activePage={pathname} />
}

export default memo(Footer)
