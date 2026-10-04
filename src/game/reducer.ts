import { createSampleField, lockPiece, spawnPiece } from './field.ts'
import type { Field, Piece, PieceType } from './types.ts'
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

// キー入力から送る action。引数を持たない
export const ACTION_TYPES = [
  'left',
  'right',
  'down',
  'rotateRight',
  'rotateLeft',
] as const
export type ActionType = (typeof ACTION_TYPES)[number]
// tick はゲームループから送る。乱数は reducer の外で選び、nextType として渡す（reducer を純粋に保つため）
export type Action =
  | { [K in ActionType]: { type: K } }[ActionType]
  | { type: 'tick'; nextType: PieceType }

export function reducer(state: GameState, action: Action): GameState {
  const { field, current } = state
  const moved = movePiece(current, action)
  if (!collides(field, moved)) return { ...state, current: moved }
  if (action.type !== 'tick') return state
  return {
    ...state,
    field: lockPiece(field, current),
    current: spawnPiece(action.nextType),
  }
}

function movePiece(current: Piece, action: Action): Piece {
  const moved = { ...current }
  switch (action.type) {
    case 'left':
      moved.x += -1
      break
    case 'right':
      moved.x += 1
      break
    case 'down':
      moved.y += 1
      break
    case 'rotateRight':
      moved.rotation = ROTATION_RIGHT[moved.rotation]
      break
    case 'rotateLeft':
      moved.rotation = ROTATION_LEFT[moved.rotation]
      break
    case 'tick':
      moved.y += 1
      break
    default:
      action satisfies never
  }
  return moved
}
