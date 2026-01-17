import type { Meta, StoryObj } from '@storybook/react'
import PasswordInput from './PasswordInput'

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof PasswordInput>

export const _PasswordInput: Story = {
  args: {},
}
