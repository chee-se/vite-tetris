import { useReducer } from 'react'
import Board from '@/components/Board.tsx'
import DebugPanel from '@/components/DebugPanel.tsx'
import { createTitleState, reducer } from '@/game/reducer.ts'
import { dropIntervalMs } from '@/game/score.ts'
import { randomPieceType } from '@/game/tetrominoes.ts'
import { useGameLoop } from '@/hooks/useGameLoop.ts'
import { useKeyboard } from '@/hooks/useKeyboard.ts'

// import.meta.env.DEV は、vite build のときに false という定数に置き換わる。
// そのため本番ビルドでは条件全体が false になり、DebugPanel はバンドルから取り除かれる
const SHOW_DEBUG = import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true'

function App() {
  // 第 3 引数の初期化関数は最初の 1 回だけ呼ばれる。
  // 乱数で next を選ぶので、定数の initialState ではなく関数で作る
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createTitleState(randomPieceType()),
  )
  useKeyboard(dispatch)
  useGameLoop(dispatch, dropIntervalMs(state.level), state.status === 'playing')

  return (
    <main className="app">
      <h1>Vite Tetris</h1>
      <div className="game">
        <div className="board-wrap">
          <Board
            field={state.field}
            current={
              state.status === 'playing' || state.status === 'paused'
                ? state.current
                : undefined
            }
          />
          {state.status === 'title' && (
            <div className="overlay">
              <p className="overlay-title">TETRIS</p>
              <p>Enter でスタート</p>
            </div>
          )}
          {state.status === 'paused' && (
            <div className="overlay">
              <p className="overlay-title">PAUSE</p>
              <p>P / Esc で再開</p>
            </div>
          )}
          {state.status === 'gameover' && (
            <div className="overlay">
              <p className="overlay-title">GAME OVER</p>
              <p>Enter でもう一度</p>
            </div>
          )}
        </div>
        <dl className="stats">
          <dt>SCORE</dt>
          <dd>{state.score}</dd>
          <dt>LINES</dt>
          <dd>{state.lines}</dd>
          <dt>LEVEL</dt>
          <dd>{state.level}</dd>
        </dl>
      </div>
      {SHOW_DEBUG && <DebugPanel state={state} />}
    </main>
  )
}

export default App
