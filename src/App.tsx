import { useReducer } from 'react'
import Board from '@/components/Board.tsx'
import DebugPanel from '@/components/DebugPanel.tsx'
import NextPiece from '@/components/NextPiece.tsx'
import Overlay from '@/components/Overlay.tsx'
import Stats from '@/components/Stats.tsx'
import { createTitleState, reducer, type GameState } from '@/game/reducer.ts'
import { dropIntervalMs } from '@/game/score.ts'
import { randomPieceType } from '@/game/tetrominoes.ts'
import { useGameLoop } from '@/hooks/useGameLoop.ts'
import { useKeyboard } from '@/hooks/useKeyboard.ts'
import styles from './App.module.css'
import logo from '@/assets/logo.svg'

// import.meta.env.DEV は、vite build のときに false という定数に置き換わる。
// そのため本番ビルドでは条件全体が false になり、DebugPanel はバンドルから取り除かれる
const SHOW_DEBUG = import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true'

// status ごとにフィールドへ重ねる表示。playing のときは何も重ねない
const OVERLAYS: Record<
  Exclude<GameState['status'], 'playing'>,
  { title: string; message: string; image?: string }
> = {
  title: { title: 'TETRIS', message: 'Enter でスタート', image: logo },
  paused: { title: 'PAUSE', message: 'P / Esc で再開' },
  gameover: { title: 'GAME OVER', message: 'Enter でもう一度' },
}

function App() {
  // 第 3 引数の初期化関数は最初の 1 回だけ呼ばれる。
  // 乱数で next を選ぶので、定数の initialState ではなく関数で作る
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createTitleState(randomPieceType()),
  )
  useKeyboard(dispatch)
  useGameLoop(dispatch, dropIntervalMs(state.level), state.status === 'playing')

  return (
    <main className={styles.app}>
      <h1>Vite Tetris</h1>
      <div className={styles.game}>
        <div className={styles.boardWrap}>
          <Board
            field={state.field}
            current={
              state.status === 'playing' || state.status === 'paused'
                ? state.current
                : undefined
            }
          />
          {state.status !== 'playing' && (
            <Overlay {...OVERLAYS[state.status]} />
          )}
        </div>
        <div className={styles.side}>
          <NextPiece type={state.next} />
          <Stats score={state.score} lines={state.lines} level={state.level} />
        </div>
      </div>
      {SHOW_DEBUG && <DebugPanel state={state} />}
    </main>
  )
}

export default App
