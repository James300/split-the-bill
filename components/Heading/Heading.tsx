import { memo } from 'react'
import './Heading.css'

export interface IHeadingProps {
  children: React.ReactNode
  className?: string
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

function Heading({ children, className, tag: Tag }: IHeadingProps) {
  return <Tag className={`${className} ${Tag}`}>{children}</Tag>
}

export default memo(Heading)
