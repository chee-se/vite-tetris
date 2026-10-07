import type { Meta, StoryObj } from '@storybook/react-vite'
import Overlay from '@/components/Overlay.tsx'
import { OVERLAYS } from '@/components/overlays.ts'

const meta = {
  component: Overlay,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '280px', height: '560px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Overlay>

export default meta
type Story = StoryObj<typeof meta>

export const Title: Story = { args: OVERLAYS.title }
export const Paused: Story = { args: OVERLAYS.paused }
export const Gameover: Story = { args: OVERLAYS.gameover }
