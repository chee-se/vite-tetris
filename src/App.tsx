import { useReducer } from 'react'
import Board from '@/components/Board.tsx'
import DebugPanel from '@/components/DebugPanel.tsx'
import { initialState, reducer } from '@/game/reducer.ts'
import { useGameLoop } from '@/hooks/useGameLoop.ts'
import { useKeyboard } from '@/hooks/useKeyboard.ts'

// 落下間隔（ミリ秒）。Step 5 でレベルに応じて短くする
const DROP_INTERVAL_MS = 1000

// import.meta.env.DEV は、vite build のときに false という定数に置き換わる。
// そのため本番ビルドでは条件全体が false になり、DebugPanel はバンドルから取り除かれる
const SHOW_DEBUG = import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  useKeyboard(dispatch)
  useGameLoop(dispatch, DROP_INTERVAL_MS)

  return (
    <main className="app">
      <h1>Vite Tetris</h1>
      <Board
        field={state.field}
        current={state.status === 'playing' ? state.current : undefined}
      />
      {SHOW_DEBUG && <DebugPanel state={state} />}
    </main>
  )
}

export default App
