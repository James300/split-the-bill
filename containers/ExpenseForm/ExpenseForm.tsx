import { memo } from 'react'
import ExpenseFormComponent from '@/components/ExpenseForm/ExpenseForm'

function ExpenseForm() {
  return (
    <ExpenseFormComponent />
  )
}

export default memo(ExpenseForm)
