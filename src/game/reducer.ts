import { createSampleField } from './field.ts'
import type { Field, Piece } from './types.ts'
import { collides } from './piece.ts'

// Step 2 で必要な分だけ。score や status は Step 4〜5 で足す（spec.md の D を参照）
export type GameState = {
  field: Field
  current: Piece
}

export const initialState: GameState = {
  field: createSampleField(),
  current: { type: 'T', rotation: 0, x: 3, y: 0 },
}

export const ACTION_TYPES = [
  'left',
  'right',
  'down',
  'rotateRight',
  'rotateLeft',
] as const
export type ActionType = (typeof ACTION_TYPES)[number]
export type Action = { [K in ActionType]: { type: K } }[ActionType]
export function reducer(state: GameState, action: Action): GameState {
  const current: Piece = { ...state.current }
  let dx = 0
  let dy = 0
  let rotate = 0

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
    case 'rotateRight':
      rotate = 1
      break
    case 'rotateLeft':
      rotate = 3
      break
    default:
      action satisfies never
  }

  current.x += dx
  current.y += dy
  current.rotation = ((current.rotation + rotate) % 4) as Piece['rotation']
  if (!collides(state.field, current)) return { ...state, current }

  return state
}
