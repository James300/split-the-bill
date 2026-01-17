import type { Meta, StoryObj } from '@storybook/react'
import Switch from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Switch>

export const _Switch: Story = {
  args: {
    label: 'Switch',
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Switch',
  },
}
