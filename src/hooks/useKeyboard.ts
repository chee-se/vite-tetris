import { useEffect, type Dispatch } from 'react'
import { MOVE_TYPES, type MoveType, type Action } from '@/game/reducer.ts'

// キー入力を reducer の action に変換する。ゲームのルールはここに書かない
export function useKeyboard(dispatch: Dispatch<Action>): void {
  useEffect(() => {
    const KEY_BINDINGS: Record<MoveType, string[]> = {
      left: ['a', 'j', 'arrowleft'],
      right: ['d', 'l', 'arrowright'],
      down: ['s', 'k', 'arrowdown'],
    }
    const handler = (e: KeyboardEvent) => {
      const type = MOVE_TYPES.find((t) =>
        KEY_BINDINGS[t].includes(e.key.toLocaleLowerCase()),
      )
      if (type !== undefined) {
        e.preventDefault()
        dispatch({ type })
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])
}
