import { useEffect, type Dispatch } from 'react'
import { ACTION_TYPES, type ActionType, type Action } from '@/game/reducer.ts'
import { randomPieceType } from '@/game/tetrominoes.ts'

// nextType を持つ action。押したときに次のミノを乱数で選んで送る
const SPAWN_ACTION_TYPES = ['hardDrop', 'restart'] as const
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
      restart: ['enter'],
    }
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
        dispatch({ type: spawnType, nextType: randomPieceType() })
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])
}
