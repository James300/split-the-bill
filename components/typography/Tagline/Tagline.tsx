import React, { memo } from 'react'

export interface ITaglineProps {
  className?: string
  children: React.ReactNode
}

function Tagline({ className, children }: ITaglineProps) {
  return (
    <div
      className={`${className} font-bold text-sm md:text-md text-(--text-tagline) uppercase`}
    >
      {children}
    </div>
  )
}

export default memo(Tagline)
