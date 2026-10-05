import {
  createSampleField,
  lockPiece,
  spawnPiece,
  clearLines,
} from './field.ts'
import type { Field, Piece, PieceType } from './types.ts'
import { collides, ROTATION_LEFT, ROTATION_RIGHT } from './piece.ts'
import { lineClearScore, levelFor } from './score.ts'

type Common = {
  field: Field
  score: number
  lines: number
  level: number
}
type Status = { status: 'playing'; current: Piece } | { status: 'gameover' }
export type GameState = Common & Status

export const initialState: GameState = {
  field: createSampleField(),
  status: 'playing',
  current: { type: 'T', rotation: 0, x: 3, y: 0 },
  score: 0,
  lines: 0,
  level: 1,
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
// tick はゲームループから送る。乱数は reducer の外で選び、nextType として渡す（reducer を純粋に保つため）。
// hardDrop もその場で固定して次のミノを出すので、nextType を持つ
export type Action =
  | { [K in ActionType]: { type: K } }[ActionType]
  | { type: 'tick'; nextType: PieceType }
  | { type: 'hardDrop'; nextType: PieceType }

export function reducer(state: GameState, action: Action): GameState {
  // ここから下では state.status が 'playing' に絞り込まれ、state.current が使える
  if (state.status !== 'playing') return state
  if (action.type === 'hardDrop') return hardDrop(state, action)

  const { field, current, score, lines, level } = state
  const moved = movePiece(current, action)
  if (!collides(field, moved))
    return {
      ...state,
      current: moved,
      score: score + (action.type === 'down' ? 1 : 0),
    }
  // 落下以外の衝突は無操作と同じ
  if (action.type !== 'tick') return state
  // 着地
  const {
    field: remaining,
    cleared,
    status: gameStatus,
  } = lockAndSpawn(field, current, action.nextType)

  return {
    ...gameStatus,
    field: remaining,
    score: score + lineClearScore(cleared, level),
    lines: lines + cleared,
    level: levelFor(lines + cleared),
  }
}

function movePiece(
  current: Piece,
  action: Exclude<Action, { type: 'hardDrop' }>,
): Piece {
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

function hardDrop(
  state: Extract<GameState, { status: 'playing' }>,
  action: Extract<Action, { nextType: PieceType }>,
): GameState {
  const { field, current, score, lines, level } = state
  const landed = dropToLand(field, current)
  const dropScore = 2 * (landed.y - current.y)
  const {
    field: remaining,
    cleared,
    status: gameStatus,
  } = lockAndSpawn(field, landed, action.nextType)

  return {
    ...gameStatus,
    field: remaining,
    score: score + dropScore + lineClearScore(cleared, level),
    lines: lines + cleared,
    level: levelFor(lines + cleared),
  }
}

function lockAndSpawn(
  field: Field,
  current: Piece,
  nextType: PieceType,
): { field: Field; cleared: number; status: Status } {
  const { field: remaining, cleared } = clearLines(lockPiece(field, current))
  const next = spawnPiece(nextType)
  const status: Status = !collides(remaining, next)
    ? { status: 'playing', current: next }
    : { status: 'gameover' }

  return {
    field: remaining,
    status,
    cleared,
  }
}

function dropToLand(field: Field, piece: Piece): Piece {
  const result = { ...piece }
  while (!collides(field, { ...result, y: result.y + 1 })) {
    result.y += 1
  }
  return result
}
