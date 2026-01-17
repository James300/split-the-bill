import { memo } from 'react'
import { Textarea as TextAreaComponent } from '../ui/textarea'

export interface ITextAreaProps extends React.ComponentProps<'textarea'> {}

function TextArea(props: ITextAreaProps) {
  return (
    <TextAreaComponent
      className="
        border-(--text-border-light)
        p-5
      "
      {...props}
    />
  )
}

export default memo(TextArea)
