import { memo } from 'react'
import Image from 'next/image'
import Heading from '@/components/Heading'

export interface IHeroImageProps {
  actionButton?: React.ReactNode
  height?: 'sm' | 'md' | 'lg'
  imageUrl: string
  mobileImageUrl?: string
  title?: string
}

function HeroImage({ actionButton, height = 'lg', imageUrl, mobileImageUrl, title }: IHeroImageProps) {
  const heightClass = {
    sm: 'h-[100px]',
    md: 'h-[300px]',
    lg: 'h-[250px] lg:h-[550px]',
  }[height]

  return (
    <div className={`relative w-full ${heightClass}`}>
      <Image src={imageUrl} alt="Hero Image" quality={100} fill className="xs:hidden lg:block object-cover" />
      <Image src={mobileImageUrl ?? imageUrl} quality={100} alt="Hero Image" fill className="lg:hidden object-cover" />
      <div className="relative flex flex-col gap-8 items-center justify-center h-full">
        {title && <Heading tag="h1">{title}</Heading>}
        {actionButton}
      </div>
    </div>
  )
}

export default memo(HeroImage)
