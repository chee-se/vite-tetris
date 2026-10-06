import { createEmptyField, lockPiece, spawnPiece, clearLines } from './field.ts'
import type { Field, Piece, PieceType } from './types.ts'
import { collides, dropToLand, ROTATION_LEFT, ROTATION_RIGHT } from './piece.ts'
import { lineClearScore, levelFor } from './score.ts'

type Common = {
  field: Field
  score: number
  lines: number
  level: number
  next: PieceType
  bag: PieceType[]
}
type Status =
  | { status: 'playing'; current: Piece; hold?: PieceType; canHold: boolean }
  | { status: 'paused'; current: Piece; hold?: PieceType; canHold: boolean }
  | { status: 'gameover' }
  | { status: 'title' }
export type GameState = Common & Status

// キー入力から送る action。引数を持たない
export const ACTION_TYPES = [
  'left',
  'right',
  'down',
  'rotateRight',
  'rotateLeft',
] as const
export type ActionType = (typeof ACTION_TYPES)[number]
// tick はゲームループから送る。乱数は reducer の外で選び、nextBag として渡す（reducer を純粋に保つため）。
// hardDrop もその場で固定して次のミノを出すので、nextBag を持つ
export type Action =
  | { [K in ActionType]: { type: K } }[ActionType]
  | { type: 'tick'; nextBag: PieceType[] }
  | { type: 'hardDrop'; nextBag: PieceType[] }
  // Enter キーで送る。タイトルかゲームオーバーから新しいゲームを始める
  | { type: 'start'; nextBag: PieceType[] }
  // P / Esc キーで送る。プレイ中と一時停止を切り替える
  | { type: 'pause' }
  | { type: 'hold'; nextBag: PieceType[] }

export function createTitleState(nextBag: PieceType[]): GameState {
  const bag = [...nextBag]
  return {
    field: createEmptyField(),
    status: 'title',
    score: 0,
    lines: 0,
    level: 1,
    next: bag.shift()!,
    bag,
  }
}

export function reducer(state: GameState, action: Action): GameState {
  if (state.status === 'title') {
    if (action.type !== 'start') return state
    return createInitialState(state.next, state.bag)
  }
  if (state.status === 'gameover') {
    if (action.type !== 'start') return state
    const nextBag = [...action.nextBag]
    return createInitialState(nextBag.shift()!, nextBag)
  }
  if (state.status === 'paused') {
    if (action.type !== 'pause') return state
    return { ...state, status: 'playing' }
  }
  if (action.type === 'start') return state

  // ここから下では state.status が 'playing' に絞り込まれ、state.current が使える
  if (state.status !== 'playing') return state
  if (action.type === 'pause') return { ...state, status: 'paused' }

  if (action.type === 'hardDrop') return hardDrop(state, action)
  if (action.type === 'hold') return holdMino(state, action)

  const { field, current, score, lines, level, next, bag, hold } = state
  const moved = movePiece(current, action)
  if (!collides(field, moved)) {
    return {
      ...state,
      current: moved,
      score: score + (action.type === 'down' ? 1 : 0),
    }
  }

  // 落下以外の衝突は無操作と同じ
  if (action.type !== 'tick') return state

  // 着地
  const {
    field: remaining,
    cleared,
    status: gameStatus,
  } = lockAndSpawn(field, current, next, hold)
  const { takenNext, takenBag } = takePieceAndBag(bag, action.nextBag)

  return {
    ...gameStatus,
    field: remaining,
    score: score + lineClearScore(cleared, level),
    lines: lines + cleared,
    level: levelFor(lines + cleared),
    next: takenNext,
    bag: takenBag,
  }
}

function movePiece(
  current: Piece,
  action: Exclude<
    Action,
    | { type: 'hardDrop' }
    | { type: 'start' }
    | { type: 'pause' }
    | { type: 'hold' }
  >,
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
  action: Extract<Action, { nextBag: PieceType[] }>,
): GameState {
  const { field, current, score, lines, level, next, bag, hold } = state
  const landed = dropToLand(field, current)
  const dropScore = 2 * (landed.y - current.y)
  const {
    field: remaining,
    cleared,
    status: gameStatus,
  } = lockAndSpawn(field, landed, next, hold)
  const { takenNext, takenBag } = takePieceAndBag(bag, action.nextBag)

  const result = {
    ...gameStatus,
    field: remaining,
    score: score + dropScore + lineClearScore(cleared, level),
    lines: lines + cleared,
    level: levelFor(lines + cleared),
    next: takenNext,
    bag: takenBag,
  }

  if (result.status === 'playing') return { ...result, hold }
  return result
}

function holdMino(
  state: Extract<GameState, { status: 'playing' }>,
  action: Extract<Action, { type: 'hold' }>,
): GameState {
  const { field, hold, canHold, current, next, bag } = state
  if (!canHold) return state

  // ホールドが空のとき、次のミノを取り出す
  if (hold === undefined) {
    const { takenNext, takenBag } = takePieceAndBag(bag, action.nextBag)
    return {
      ...state,
      hold: current.type,
      canHold: false,
      current: spawnPiece(next),
      next: takenNext,
      bag: takenBag,
    }
  }

  // ホールドで戻せないとき、無視する
  if (collides(field, spawnPiece(hold))) return state

  return {
    ...state,
    hold: current.type,
    canHold: false,
    current: spawnPiece(hold),
  }
}

function lockAndSpawn(
  field: Field,
  current: Piece,
  nextType: PieceType,
  hold?: PieceType,
): { field: Field; cleared: number; status: Status } {
  const { field: remaining, cleared } = clearLines(lockPiece(field, current))
  const next = spawnPiece(nextType)
  const status: Status = !collides(remaining, next)
    ? { status: 'playing', current: next, canHold: true, hold }
    : { status: 'gameover' }

  return {
    field: remaining,
    status,
    cleared,
  }
}

function createInitialState(
  current: PieceType,
  nextBag: PieceType[],
): GameState {
  const bag = [...nextBag]
  return {
    field: createEmptyField(),
    status: 'playing',
    current: spawnPiece(current),
    score: 0,
    lines: 0,
    level: 1,
    next: bag.shift()!,
    bag,
    canHold: true,
  }
}

function takePieceAndBag(
  bag: PieceType[],
  nextBag: PieceType[],
): { takenNext: PieceType; takenBag: PieceType[] } {
  const bagClone = [...bag]
  return {
    takenNext: bagClone.shift()!,
    takenBag: bagClone.length > 0 ? bagClone : nextBag,
  }
}
