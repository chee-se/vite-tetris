import { useEffect, type Dispatch } from 'react'
import { ACTION_TYPES, type ActionType, type Action } from '@/game/reducer.ts'
import { randomPieceBag } from '@/game/tetrominoes.ts'

// nextBag を持つ action。押したときに次のミノを乱数で並べたバッグを送る
const SPAWN_ACTION_TYPES = ['hardDrop', 'start', 'hold'] as const
type SpawnActionType = (typeof SPAWN_ACTION_TYPES)[number]

// キー入力を reducer の action に変換する。ゲームのルールはここに書かない
export function useKeyboard(dispatch: Dispatch<Action>): void {
  useEffect(() => {
    const KEY_BINDINGS: Record<ActionType, string[]> = {
      left: ['a', 'j', 'arrowleft'],
      right: ['d', 'l', 'arrowright'],
      down: ['s', 'k', 'arrowdown'],
      rotateRight: ['arrowup', 'x'],
      rotateLeft: ['z'],
    }
    // e.key は Space のとき ' '（空白 1 文字）になる
    const SPAWN_KEY_BINDINGS: Record<SpawnActionType, string[]> = {
      hardDrop: [' '],
      start: ['enter'],
      hold: ['c'],
    }
    const PAUSE_KEYS = ['p', 'escape']
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLocaleLowerCase()
      const type = ACTION_TYPES.find((t) => KEY_BINDINGS[t].includes(key))
      if (type !== undefined) {
        e.preventDefault()
        dispatch({ type })
        return
      }
      const spawnType = SPAWN_ACTION_TYPES.find((t) =>
        SPAWN_KEY_BINDINGS[t].includes(key),
      )
      if (spawnType !== undefined) {
        e.preventDefault()
        // 押しっぱなしのキーリピートで、ハードドロップが連続しないようにする
        if (e.repeat) return
        dispatch({ type: spawnType, nextBag: randomPieceBag() })
        return
      }
      if (PAUSE_KEYS.includes(key)) {
        e.preventDefault()
        // 押しっぱなしで一時停止と再開が繰り返されないようにする
        if (e.repeat) return
        dispatch({ type: 'pause' })
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])
}
