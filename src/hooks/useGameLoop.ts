import { useEffect, type Dispatch } from 'react'
import type { Action } from '@/game/reducer.ts'

// requestAnimationFrame で毎フレーム呼ばれ、前回の tick から intervalMs 以上たったら
// tick を 1 回送る。ゲームのルール（落ちる・固定する）はここに書かない
export function useGameLoop(
  dispatch: Dispatch<Action>,
  intervalMs: number,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return

    const loop = (now: number) => {
      if (lastTick + intervalMs <= now) {
        dispatch({ type: 'tick' })
        lastTick = now
      }
      frameId = requestAnimationFrame(loop)
    }
    let lastTick = performance.now()
    let frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [dispatch, intervalMs, enabled])
}
