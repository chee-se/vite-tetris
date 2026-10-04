import type { GameState } from '@/game/reducer.ts'

type Props = {
  state: GameState
}

// 開発中に state の中身を見るための表示。本番ビルドには含めない（App.tsx を参照）
function DebugPanel({ state }: Props) {
  const { type, rotation, x, y } = state.current
  const filled = state.field.flat().filter((cell) => cell !== 0).length

  return (
    <dl className="debug">
      <dt>mode</dt>
      <dd>{import.meta.env.MODE}</dd>
      <dt>current</dt>
      <dd>
        {type} (x: {x}, y: {y}, rotation: {rotation})
      </dd>
      <dt>固定ブロック</dt>
      <dd>{filled} マス</dd>
    </dl>
  )
}

export default DebugPanel
