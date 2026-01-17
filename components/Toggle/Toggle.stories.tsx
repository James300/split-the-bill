import type { Meta, StoryObj } from '@storybook/react'
import Toggle from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Toggle>

export const _Toggle: Story = {
  args: {
    label: 'Toggle',
    onClick: () => {
      console.log('Toggled')
    },
  },
}

export const Pressed: Story = {
  args: {
    label: 'Toggle',
    pressed: true,
  },
}
