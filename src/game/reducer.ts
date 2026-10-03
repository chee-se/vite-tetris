import { createSampleField } from './field.ts'
import type { Field, Piece } from './types.ts'
import { collides, ROTATION_LEFT, ROTATION_RIGHT } from './piece.ts'

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

  switch (action.type) {
    case 'left':
      current.x += -1
      break
    case 'right':
      current.x += 1
      break
    case 'down':
      current.y += 1
      break
    case 'rotateRight':
      current.rotation = ROTATION_RIGHT[current.rotation]
      break
    case 'rotateLeft':
      current.rotation = ROTATION_LEFT[current.rotation]
      break
    default:
      action satisfies never
  }

  if (!collides(state.field, current)) return { ...state, current }

  return state
}
