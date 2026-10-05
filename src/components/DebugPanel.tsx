import type { GameState } from '@/game/reducer.ts'

type Props = {
  state: GameState
}

// 開発中に state の中身を見るための表示。本番ビルドには含めない（App.tsx を参照）
function DebugPanel({ state }: Props) {
  const filled = state.field.flat().filter((cell) => cell !== 0).length

  return (
    <dl className="debug">
      <dt>mode</dt>
      <dd>{import.meta.env.MODE}</dd>
      <dt>status</dt>
      <dd>{state.status}</dd>
      {state.status === 'playing' && (
        <>
          <dt>current</dt>
          <dd>
            {state.current.type} (x: {state.current.x}, y: {state.current.y},
            rotation: {state.current.rotation})
          </dd>
        </>
      )}
      <dt>固定ブロック</dt>
      <dd>{filled} マス</dd>
    </dl>
  )
}

export default DebugPanel
