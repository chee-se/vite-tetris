import { createEmptyField, lockPiece, spawnPiece, clearLines } from './field.ts'
import type { Field, Piece, PieceType } from './types.ts'
import {
  collides,
  dropToLand,
  srsRotate,
  ROTATION_LEFT,
  ROTATION_RIGHT,
} from './piece.ts'
import { lineClearScore, levelFor } from './score.ts'
import { drawPieceBag } from './tetrominoes.ts'

type Common = {
  field: Field
  score: number
  lines: number
  level: number
  rng: number
}
type PlayingProperty = {
  current: Piece
  hold?: PieceType
  canHold: boolean
  next: PieceType
  bag: PieceType[]
}
type Status =
  | ({ status: 'playing' } & PlayingProperty)
  | ({ status: 'paused' } & PlayingProperty)
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
// tick はゲームループから送る。
export type Action =
  | { [K in ActionType]: { type: K } }[ActionType]
  | { type: 'tick' }
  | { type: 'hardDrop' }
  // Enter キーで送る。タイトルかゲームオーバーから新しいゲームを始める
  | { type: 'start' }
  // P / Esc キーで送る。プレイ中と一時停止を切り替える
  | { type: 'pause' }
  | { type: 'hold' }

export function createTitleState(rng: number): GameState {
  return {
    field: createEmptyField(),
    score: 0,
    lines: 0,
    level: 1,
    rng,
    status: 'title',
  }
}

function createInitialState(rng: number): GameState {
  const {
    bag: [current, next, ...bag],
    rng: nextRng,
  } = drawPieceBag(rng) as {
    bag: [PieceType, PieceType, ...PieceType[]]
    rng: number
  }
  return {
    field: createEmptyField(),
    score: 0,
    lines: 0,
    level: 1,
    rng: nextRng,
    status: 'playing',
    current: spawnPiece(current),
    next,
    canHold: true,
    bag,
  }
}

export function reducer(state: GameState, action: Action): GameState {
  // Common ステータス
  const { status, field, score, lines, level, rng } = state
  const { type: actionType } = action

  if (status === 'title') {
    if (actionType !== 'start') return state
    return createInitialState(rng)
  }
  if (status === 'gameover') {
    if (actionType !== 'start') return state
    return createInitialState(rng)
  }
  if (status === 'paused') {
    if (actionType !== 'pause') return state
    return { ...state, status: 'playing' }
  }
  if (action.type === 'start') return state

  // ここから下では state.status が 'playing' に絞り込まれ、state.current が使える
  if (state.status !== 'playing') return state
  // PlayingStatus
  const { current, next, bag, hold } = state
  if (actionType === 'pause') return { ...state, status: 'paused' }
  if (actionType === 'hardDrop') return hardDrop(state)
  if (actionType === 'hold') return holdMino(state)

  // 回転
  if (actionType === 'rotateRight' || actionType === 'rotateLeft')
    return rotatePiece(state, action)

  // 移動
  const moved = movePiece(current, action)
  if (!collides(field, moved)) {
    return {
      ...state,
      current: moved,
      score: score + (actionType === 'down' ? 1 : 0),
    }
  }
  // 落下以外の衝突は無操作扱い
  if (actionType !== 'tick') return state

  // 着地
  const {
    field: remaining,
    rng: nextRng,
    cleared,
    status: resultStatus,
  } = lockAndSpawn(field, rng, current, next, bag, hold)
  return {
    ...resultStatus,
    field: remaining,
    rng: nextRng,
    score: score + lineClearScore(cleared, level),
    lines: lines + cleared,
    level: levelFor(lines + cleared),
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
    | { type: 'rotateRight' }
    | { type: 'rotateLeft' }
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
    case 'tick':
      moved.y += 1
      break
    default:
      action satisfies never
  }
  return moved
}

function rotatePiece(
  state: Extract<GameState, { status: 'playing' }>,
  action: Extract<Action, { type: 'rotateRight' } | { type: 'rotateLeft' }>,
): GameState {
  const rotationTable =
    action.type === 'rotateRight' ? ROTATION_RIGHT : ROTATION_LEFT
  const { field, current } = state
  const { rotation } = current
  const rotated = srsRotate(field, current, rotationTable[rotation])
  if (rotated.rotation === rotation) return state
  return { ...state, current: rotated }
}

function hardDrop(state: Extract<GameState, { status: 'playing' }>): GameState {
  const { field, rng, current, score, lines, level, next, bag, hold } = state
  const landed = dropToLand(field, current)
  const dropScore = 2 * (landed.y - current.y)
  const {
    field: remaining,
    rng: nextRng,
    cleared,
    status: resultStatus,
  } = lockAndSpawn(field, rng, landed, next, bag, hold)

  const result = {
    ...resultStatus,
    field: remaining,
    score: score + dropScore + lineClearScore(cleared, level),
    lines: lines + cleared,
    level: levelFor(lines + cleared),
    rng: nextRng,
  }

  if (result.status === 'playing') return { ...result, hold }
  return result
}

function holdMino(state: Extract<GameState, { status: 'playing' }>): GameState {
  const { field, rng, hold, canHold, current, next, bag } = state
  if (!canHold) return state

  // ホールドが空のとき、次のミノを取り出す
  if (hold === undefined) {
    const { nextPiece, nextBag, nextRng } = takePiece(bag, rng)
    return {
      ...state,
      rng: nextRng,
      hold: current.type,
      canHold: false,
      current: spawnPiece(next),
      next: nextPiece,
      bag: nextBag,
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
  rng: number,
  current: Piece,
  nextType: PieceType,
  bag: PieceType[],
  hold?: PieceType,
): { field: Field; rng: number; cleared: number; status: Status } {
  const { field: remaining, cleared } = clearLines(lockPiece(field, current))
  const spawned = spawnPiece(nextType)
  const result = { field: remaining, cleared }

  if (!collides(remaining, spawned)) {
    const { nextPiece, nextBag, nextRng } = takePiece(bag, rng)
    const plyaingStatus: Status = {
      status: 'playing',
      current: spawned,
      hold,
      canHold: true,
      next: nextPiece,
      bag: nextBag,
    }
    return { ...result, rng: nextRng, status: plyaingStatus }
  }
  return { ...result, rng, status: { status: 'gameover' } }
}

function takePiece(
  bag: PieceType[],
  rng: number,
): { nextPiece: PieceType; nextBag: PieceType[]; nextRng: number } {
  const [nextPiece, ...remaining] = bag as [PieceType, ...PieceType[]]
  const { bag: nextBag, rng: nextRng } =
    remaining.length === 0 ? drawPieceBag(rng) : { bag: remaining, rng }
  return {
    nextPiece,
    nextBag,
    nextRng,
  }
}
