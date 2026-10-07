import type { Meta, StoryObj } from '@storybook/react-vite'
import Board from '@/components/Board.tsx'
import {
  createEmptyField,
  createSampleField,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  spawnPiece,
} from '@/game/field.ts'
import { dropToLand } from '@/game/piece.ts'
import type { Cell, Field } from '@/game/types.ts'

const BLOCK_COLORS: Cell[] = [1, 2, 3, 4, 5, 6, 7]

// 下から height 段ブロックを積んだフィールドを作る（story の見た目を確かめるためだけのデータ）。
// 揃った行は実際のゲームでは消えるので、どの段にも 1 マスだけ穴を空ける
function createStackedField(height: number): Field {
  const field = createEmptyField()
  for (let i = 0; i < height; i++) {
    // 穴の位置を段ごとにずらして、まっすぐな縦穴にならないようにする
    const hole = (i * 3) % FIELD_WIDTH
    field[FIELD_HEIGHT - 1 - i] = Array.from(
      { length: FIELD_WIDTH },
      (_, x): Cell =>
        x === hole ? 0 : (BLOCK_COLORS[(x + i) % BLOCK_COLORS.length] ?? 1),
    )
  }
  return field
}

const meta = {
  component: Board,
} satisfies Meta<typeof Board>

export default meta
type Story = StoryObj<typeof meta>

// フィールドに何もなく、落下中のミノもない（タイトル画面やゲームオーバーで current を渡さないとき）
export const Empty: Story = {
  args: { field: createEmptyField() },
}

// フィールドに何もなく、落下中のミノとゴーストのみ
export const EmptyWithGhost: Story = {
  args: { field: createEmptyField(), current: spawnPiece('Z') },
}

// 落下中のミノとゴーストが重なった状態
const landedMino = dropToLand(createEmptyField(), {
  ...spawnPiece('Z'),
  rotation: 1,
})
export const MinoOverGhost: Story = {
  args: {
    field: createEmptyField(),
    current: { ...landedMino, y: landedMino.y - 1 },
  },
}

// 固定ミノとゴースト
export const GhostOnStack: Story = {
  args: { field: createSampleField(), current: spawnPiece('Z') },
}

// ゲームオーバー直前。出現したミノのすぐ下まで積み上がっている
export const AlmostOver: Story = {
  args: {
    // Z は上の 2 行に出るので、17 段積むと 1 行だけすき間が残る（18 段でミノとゴーストが重なる）
    field: createStackedField(17),
    current: spawnPiece('Z'),
  },
}
