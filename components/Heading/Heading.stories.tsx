import { Meta, StoryObj } from '@storybook/react'
import Heading from './Heading'

const meta: Meta = {
  title: 'Components/Heading',
  component: Heading,
} as Meta

export default meta
type Story = StoryObj<typeof Heading>

export const H1: Story = {
  args: {
    tag: 'h1',
    children: 'Heading 1',
  },
}

export const H2: Story = {
  args: {
    tag: 'h2',
    children: 'Heading 2',
  },
}

export const H3: Story = {
  args: {
    tag: 'h3',
    children: 'Heading 3',
  },
}

export const H4: Story = {
  args: {
    tag: 'h4',
    children: 'Heading 4',
  },
}

export const H5: Story = {
  args: {
    tag: 'h5',
    children: 'Heading 5',
  },
}

export const H6: Story = {
  args: {
    tag: 'h6',
    children: 'Heading 6',
  },
}
