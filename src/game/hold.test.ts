import { describe, expect, test } from 'vitest'
import { createEmptyField, spawnPiece } from '@/game/field.ts'
import {
  createTitleState,
  reducer,
  type Action,
  type GameState,
} from '@/game/reducer.ts'
import type { PieceType } from '@/game/types.ts'
import { randomPieceBag } from '@/game/tetrominoes.ts'

// holdAction: ホールドの action を作る。hooks が送るときと同じ作り方にする
function holdAction(): Action {
  return { type: 'hold', nextBag: randomPieceBag() }
}
// ホールド中のミノの種類を返す。ホールドが空なら undefined
function heldType(state: GameState): PieceType | undefined {
  if (state.status === 'playing') return state.hold
  if (state.status === 'paused') return state.hold
  return
}

type PlayingState = Extract<GameState, { status: 'playing' }>

// 袋が空になったときに使う予備の袋。このテストでは使われない
const SPARE_BAG: PieceType[] = ['L', 'J', 'Z', 'S', 'T', 'O', 'I']

// 最初の袋を固定してゲームを始める。
// current = T、next = I、袋の残り = O, S, Z, J, L
function startGame(): PlayingState {
  const title = createTitleState(['T', 'I', 'O', 'S', 'Z', 'J', 'L'])
  return play(title, { type: 'start', nextBag: SPARE_BAG })
}

// reducer を呼び、結果がまだ playing であることを確かめてから返す
function play(state: GameState, action: Action): PlayingState {
  const next = reducer(state, action)
  if (next.status !== 'playing') throw new Error(`status が ${next.status}`)
  return next
}

const hold = (state: GameState) => play(state, holdAction())

// 空のフィールドでハードドロップして、次のミノを出す
const drop = (state: PlayingState) =>
  play(
    { ...state, field: createEmptyField() },
    { type: 'hardDrop', nextBag: SPARE_BAG },
  )

describe('ホールド: 空のホールドに入れる', () => {
  test('ゲーム開始時はホールドが空', () => {
    expect(heldType(startGame())).toBeUndefined()
  })

  test('今のミノがホールドに入り、next のミノが出現位置に出る', () => {
    const state = hold(startGame())
    expect(heldType(state)).toBe('T')
    expect(state.current).toEqual(spawnPiece('I'))
  })

  test('next には袋の先頭が入る（袋から 1 つ取り出す）', () => {
    const state = hold(startGame())
    expect(state.next).toBe('O')
  })

  test('フィールドとスコアは変わらない', () => {
    const before = startGame()
    const state = hold(before)
    expect(state.field).toEqual(before.field)
    expect(state.score).toBe(before.score)
  })
})

describe('ホールド: ホールド中のミノと入れ替える', () => {
  // T をホールド → I を落とす → O が出ている状態
  const holdingT = () => drop(hold(startGame()))

  test('今のミノとホールド中のミノが入れ替わる', () => {
    const before = holdingT()
    expect(before.current.type).toBe('O')
    const state = hold(before)
    expect(heldType(state)).toBe('O')
    expect(state.current).toEqual(spawnPiece('T'))
  })

  test('入れ替えでは袋を使わない（next も袋も変わらない）', () => {
    const before = holdingT()
    const state = hold(before)
    expect(state.next).toBe(before.next)
    expect(state.bag).toEqual(before.bag)
  })

  test('ホールドから出したミノは、出現位置に初期の向きで出る', () => {
    // O を動かしたり回したりしてからホールドし、次の番で取り出す
    let state = holdingT()
    state = play(state, { type: 'left' })
    state = play(state, { type: 'down' })
    state = play(state, { type: 'rotateRight' })
    state = hold(state) // O をホールド、T が出る
    state = drop(state) // 次のミノが出て、またホールドできる
    state = hold(state) // O を取り出す
    expect(state.current).toEqual(spawnPiece('O'))
  })
})

describe('ホールド: 着地してもホールド中のミノは残る', () => {
  test('ハードドロップで固定しても残る', () => {
    const state = drop(hold(startGame()))
    expect(heldType(state)).toBe('T')
  })

  test('自然落下（tick）で固定しても残る', () => {
    let state: PlayingState = hold(startGame())
    state = { ...state, current: { ...state.current, y: 18 } }
    state = play(state, { type: 'tick', nextBag: SPARE_BAG })
    expect(heldType(state)).toBe('T')
  })
})

describe('ホールド: 1 つのミノにつき 1 回だけ', () => {
  test('ホールドした直後のミノは、もうホールドできない', () => {
    const once = hold(startGame())
    const twice = hold(once)
    expect(heldType(twice)).toBe('T')
    expect(twice.current).toEqual(once.current)
    expect(twice.next).toBe(once.next)
  })

  test('入れ替えた直後のミノも、もうホールドできない', () => {
    const swapped = hold(drop(hold(startGame())))
    const again = hold(swapped)
    expect(heldType(again)).toBe(heldType(swapped))
    expect(again.current).toEqual(swapped.current)
  })

  test('ミノが固定されたら、またホールドできる（ハードドロップ）', () => {
    const state = hold(drop(hold(startGame())))
    expect(heldType(state)).toBe('O')
  })

  test('ミノが固定されたら、またホールドできる（自然落下）', () => {
    let state: PlayingState = hold(startGame())
    // I を床まで落とし、tick で固定させる
    state = { ...state, current: { ...state.current, y: 18 } }
    state = play(state, { type: 'tick', nextBag: SPARE_BAG })
    expect(state.current.type).toBe('O')
    expect(heldType(hold(state))).toBe('O')
  })
})

describe('ホールド: プレイ中以外', () => {
  test('一時停止中はホールドできない', () => {
    const paused = reducer(startGame(), { type: 'pause' })
    expect(reducer(paused, holdAction())).toEqual(paused)
  })

  test('タイトル画面ではホールドできない', () => {
    const title = createTitleState(['T', 'I', 'O', 'S', 'Z', 'J', 'L'])
    expect(reducer(title, holdAction())).toEqual(title)
  })

  test('ゲームオーバーから start すると、ホールドは空に戻る', () => {
    const state = hold(startGame())
    const { current: _, ...rest } = state
    const gameover = { ...rest, status: 'gameover' } as GameState
    const restarted = play(gameover, { type: 'start', nextBag: SPARE_BAG })
    expect(heldType(restarted)).toBeUndefined()
  })
})

test('ホールドしても元の state を書き換えない', () => {
  const state = drop(hold(startGame()))
  const before = structuredClone(state)
  hold(state)
  hold(hold(startGame()))
  expect(state).toEqual(before)
})

// 設計で決めること。決めたら test に書き換える
test('ホールドから出したミノが出現位置に置けないときは、ホールドを無視する', () => {
  // T をホールドし、O が出ている状態。T の出現位置（x = 3〜5, y = 0〜1）のうち、
  // O とは重ならない (3, 1) をふさぐ
  const field = createEmptyField()
  field[1]![3] = 1
  const state = { ...drop(hold(startGame())), field }
  expect(reducer(state, holdAction())).toEqual(state)
})
