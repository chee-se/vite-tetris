import { createSampleField } from './field.ts'
import type { Field, Piece } from './types.ts'

// Step 2 で必要な分だけ。score や status は Step 4〜5 で足す（spec.md の D を参照）
export type GameState = {
  field: Field
  current: Piece
}

export const initialState: GameState = {
  field: createSampleField(),
  current: { type: 'T', rotation: 0, x: 3, y: 0 },
}

// 衝突判定は Step 3。今は壁をすり抜ける
export const MOVE_TYPES = ['left', 'right', 'down'] as const
export type MoveType = (typeof MOVE_TYPES)[number]
export type Action = { [K in MoveType]: { type: K } }[MoveType]
export function reducer(state: GameState, action: Action): GameState {
  const current: Piece = { ...state.current }
  let dx = 0
  let dy = 0

  switch (action.type) {
    case 'left':
      dx = -1
      break
    case 'right':
      dx = 1
      break
    case 'down':
      dy = 1
      break
    default:
      action satisfies never
  }
  current.x += dx
  current.y += dy

  return { ...state, current }
}
