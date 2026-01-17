import type { Meta, StoryObj } from '@storybook/react'
import RadioGroup from './RadioGroup'

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RadioGroup>

export const _RadioGroup: Story = {
  args: {
    items: ['Manitoba', 'British Columbia', 'Ontario'],
  },
}
