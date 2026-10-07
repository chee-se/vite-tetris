import { useReducer } from 'react'
import Board from '@/components/Board.tsx'
import DebugPanel from '@/components/DebugPanel.tsx'
import PiecePreview from '@/components/PiecePreview.tsx'
import Overlay from '@/components/Overlay.tsx'
import { OVERLAYS } from '@/components/overlays.ts'
import Stats from '@/components/Stats.tsx'
import { createTitleState, reducer } from '@/game/reducer.ts'
import { dropIntervalMs } from '@/game/score.ts'
import { randomSeed } from '@/game/random.ts'
import type { PieceType } from '@/game/types.ts'
import { useGameLoop } from '@/hooks/useGameLoop.ts'
import { useKeyboard } from '@/hooks/useKeyboard.ts'
import styles from './App.module.css'

// import.meta.env.DEV は、vite build のときに false という定数に置き換わる。
// そのため本番ビルドでは条件全体が false になり、DebugPanel はバンドルから取り除かれる
const SHOW_DEBUG = import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true'

function App() {
  // 第 3 引数の初期化関数は最初の 1 回だけ呼ばれる。
  // 乱数で最初のバッグを作るので、定数の initialState ではなく関数で作る
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    if (!import.meta.env.DEV) {
      return createTitleState(randomSeed())
    }
    const urlParams = new URLSearchParams(window.location.search)
    const paramSeed = Number(urlParams.get('seed') || NaN)
    return createTitleState(
      Number.isInteger(paramSeed) ? paramSeed : randomSeed(),
    )
  })

  useKeyboard(dispatch)
  useGameLoop(dispatch, dropIntervalMs(state.level), state.status === 'playing')

  const playingOrPaused =
    state.status === 'playing' || state.status === 'paused'
  const hold: PieceType | undefined = playingOrPaused ? state.hold : undefined
  const canHold: boolean | undefined = playingOrPaused
    ? state.canHold
    : undefined

  return (
    <main className={styles.app}>
      <h1>Vite Tetris</h1>
      <div className={styles.game}>
        <div className={styles.holdSide}>
          <PiecePreview
            type={hold}
            label={'HOLD'}
            disabled={canHold === false}
          />
        </div>
        <div className={styles.boardWrap}>
          <Board
            field={state.field}
            current={playingOrPaused ? state.current : undefined}
          />
          {state.status !== 'playing' && (
            <Overlay {...OVERLAYS[state.status]} />
          )}
        </div>
        <div className={styles.side}>
          <PiecePreview
            type={playingOrPaused ? state.next : undefined}
            label={'NEXT'}
          />
          <Stats score={state.score} lines={state.lines} level={state.level} />
        </div>
      </div>
      {SHOW_DEBUG && <DebugPanel state={state} />}
    </main>
  )
}

export default App
