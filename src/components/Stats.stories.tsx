import type { Meta, StoryObj } from '@storybook/react-vite'
import Stats from '@/components/Stats.tsx'

// どのコンポーネントの story かを Storybook に伝える。
// title を省くと、ファイルの場所から「components/Stats」のように自動で付く
const meta = {
  component: Stats,
} satisfies Meta<typeof Stats>

export default meta
type Story = StoryObj<typeof meta>

// export した 1 つ 1 つが story になる。args が Props として渡される
export const Start: Story = {
  args: { score: 0, lines: 0, level: 1 },
}

// 桁が増えたときに表示が崩れないかを見る
export const LargeNumbers: Story = {
  args: { score: 9999999, lines: 999, level: 99 },
}
