import type { Meta, StoryObj } from '@storybook/react-vite'
import { PIECE_TYPES } from '@/game/types.ts'
import PiecePreview from '@/components/PiecePreview.tsx'

const meta = {
  component: PiecePreview,
  args: { label: 'NEXT' },
} satisfies Meta<typeof PiecePreview>

export default meta
type Story = StoryObj<typeof meta>

export const NextMinoI: Story = {
  argTypes: { type: { control: 'select', options: PIECE_TYPES } },
  args: { type: PIECE_TYPES[0] },
}

export const Hold: Story = {
  args: { type: PIECE_TYPES[0], label: 'HOLD' },
}

export const DisabledHold: Story = {
  args: { type: PIECE_TYPES[0], label: 'HOLD', disabled: true },
}

export const EmptyHold: Story = {
  args: { label: 'HOLD' },
}
