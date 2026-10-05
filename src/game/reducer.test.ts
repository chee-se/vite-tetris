import { describe, expect, test } from 'vitest'
import { createEmptyField, lockPiece, spawnPiece } from '@/game/field.ts'
import { reducer, type Action, type GameState } from '@/game/reducer.ts'
import type { Piece } from '@/game/types.ts'

type PlayingState = Extract<GameState, { status: 'playing' }>

const stateWith = (
  current: Piece,
  field = createEmptyField(),
): PlayingState => ({
  status: 'playing',
  field,
  current,
  score: 0,
  lines: 0,
  level: 1,
})

// reducer を呼び、結果がまだ playing であることを確かめてから返す。
// 戻り値の型が PlayingState に絞られるので、テストで .current を読める
function play(state: GameState, action: Action): PlayingState {
  const next = reducer(state, action)
  if (next.status !== 'playing') throw new Error(`status が ${next.status}`)
  return next
}

describe('reducer: 移動', () => {
  test('ぶつからなければ動く', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 0 })
    expect(play(state, { type: 'left' }).current.x).toBe(2)
    expect(play(state, { type: 'right' }).current.x).toBe(4)
    expect(play(state, { type: 'down' }).current.y).toBe(1)
  })

  test('移動しても向きは変わらない', () => {
    const state = stateWith({ type: 'T', rotation: 2, x: 3, y: 5 })
    expect(play(state, { type: 'left' }).current.rotation).toBe(2)
    expect(play(state, { type: 'down' }).current.rotation).toBe(2)
  })

  test('壁にぶつかるなら動かない', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 0, y: 0 })
    expect(play(state, { type: 'left' }).current).toEqual(state.current)
  })

  test('床にぶつかるなら動かない', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 18 })
    expect(play(state, { type: 'down' }).current).toEqual(state.current)
  })

  test('固定ブロックにぶつかるなら動かない', () => {
    const field = createEmptyField()
    field[2]![4] = 1 // T の 2 行目の真下
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 0 }, field)
    expect(play(state, { type: 'down' }).current).toEqual(state.current)
  })
})

describe('reducer: 回転', () => {
  test('右回転で rotation が 1 増え、3 の次は 0 に戻る', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 5 })
    expect(play(state, { type: 'rotateRight' }).current.rotation).toBe(1)
    const last = stateWith({ type: 'T', rotation: 3, x: 3, y: 5 })
    expect(play(last, { type: 'rotateRight' }).current.rotation).toBe(0)
  })

  test('左回転で rotation が 1 減り、0 の次は 3 に戻る', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 5 })
    expect(play(state, { type: 'rotateLeft' }).current.rotation).toBe(3)
  })

  test('回転後にぶつかるなら回転しない（壁蹴りなし）', () => {
    // 縦向きの I を左の壁に寄せた状態。横向きにすると左にはみ出す
    const state = stateWith({ type: 'I', rotation: 1, x: -2, y: 5 })
    expect(play(state, { type: 'rotateRight' }).current).toEqual(state.current)
  })
})

describe('reducer: tick', () => {
  test('下に動けるなら 1 マス落ちる。フィールドは変わらない', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 5 })
    const next = play(state, { type: 'tick', nextType: 'O' })
    expect(next.current).toEqual({ ...state.current, y: 6 })
    expect(next.field).toBe(state.field)
  })

  test('下に動けないなら、その位置で固定する', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 18 })
    const next = play(state, { type: 'tick', nextType: 'O' })
    expect(next.field).toEqual(lockPiece(state.field, state.current))
  })

  test('固定したら、nextType のミノが出現位置に出る', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 18 })
    const next = play(state, { type: 'tick', nextType: 'O' })
    expect(next.current).toEqual(spawnPiece('O'))
  })

  test('固定ブロックの上に着地しても固定する', () => {
    const field = createEmptyField()
    field[10]![4] = 1 // T の 2 行目の真下
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 8 }, field)
    const next = play(state, { type: 'tick', nextType: 'I' })
    expect(next.field[9]).toEqual([0, 0, 0, 3, 3, 3, 0, 0, 0, 0])
    expect(next.current).toEqual(spawnPiece('I'))
  })

  test('↓ キー（down）では、着地しても固定しない', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 18 })
    expect(reducer(state, { type: 'down' })).toBe(state)
  })
})

describe('reducer: 固定したあとのライン消去・スコア・ゲームオーバー', () => {
  // 一番下の行の右 6 マス（x = 4〜9）を埋めたフィールド。
  // 横向きの I（rotation = 0）を x = 0, y = 18 に置くと、左 4 マスが埋まって 1 行そろう
  const almostFull = () => {
    const field = createEmptyField()
    field[19] = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
    return field
  }
  const landingI: Piece = { type: 'I', rotation: 0, x: 0, y: 18 }

  test('固定して行がそろったら消す', () => {
    const next = play(stateWith(landingI, almostFull()), {
      type: 'tick',
      nextType: 'O',
    })
    expect(next.field).toEqual(createEmptyField())
    expect(next.lines).toBe(1)
  })

  test('消した行数とレベルに応じて得点が入る', () => {
    const state = { ...stateWith(landingI, almostFull()), score: 50, level: 3 }
    const next = play(state, { type: 'tick', nextType: 'O' })
    expect(next.score).toBe(50 + 100 * 3)
  })

  test('得点は消す前のレベルで計算し、そのあと 10 ラインごとにレベルが上がる', () => {
    const state = { ...stateWith(landingI, almostFull()), lines: 9, level: 1 }
    const next = play(state, { type: 'tick', nextType: 'O' })
    expect(next.score).toBe(100)
    expect(next.lines).toBe(10)
    expect(next.level).toBe(2)
  })

  test('行がそろわなければ、得点もライン数も変わらない', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 18 })
    const next = play(state, { type: 'tick', nextType: 'O' })
    expect(next.score).toBe(0)
    expect(next.lines).toBe(0)
  })

  test('次のミノが出現位置に置けなければゲームオーバー', () => {
    const field = createEmptyField()
    field[0]![4] = 1 // O の出現位置（x = 4〜5, y = 0〜1）をふさぐ
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 18 }, field)
    const next = reducer(state, { type: 'tick', nextType: 'O' })
    expect(next.status).toBe('gameover')
    // gameover の型には current がない。前の state の current が残っていないこと
    expect(next).not.toHaveProperty('current')
    // 最後のミノは固定されている
    expect(next.field[19]).toEqual([0, 0, 0, 3, 3, 3, 0, 0, 0, 0])
  })

  test('ゲームオーバー中は、どの action でも state が変わらない', () => {
    const { current: _, ...rest } = stateWith(landingI)
    const state: GameState = { ...rest, status: 'gameover' }
    expect(reducer(state, { type: 'left' })).toBe(state)
    expect(reducer(state, { type: 'tick', nextType: 'O' })).toBe(state)
  })
})

describe('reducer: ドロップの得点', () => {
  test('ソフトドロップ（down）で 1 マス下がるごとに +1', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 5 })
    expect(play(state, { type: 'down' }).score).toBe(1)
  })

  test('tick（自然落下）では得点が増えない', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 5 })
    expect(play(state, { type: 'tick', nextType: 'O' }).score).toBe(0)
  })

  test('ハードドロップは一番下まで落として、すぐ固定する', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 0 })
    const next = play(state, { type: 'hardDrop', nextType: 'O' })
    expect(next.field[19]).toEqual([0, 0, 0, 3, 3, 3, 0, 0, 0, 0])
    expect(next.current).toEqual(spawnPiece('O'))
  })

  test('ハードドロップは落とした距離 1 マスごとに +2', () => {
    // y = 0 から y = 18 まで 18 マス落ちる
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 0 })
    expect(play(state, { type: 'hardDrop', nextType: 'O' }).score).toBe(36)
  })

  test('ハードドロップで行がそろえば、ライン消去の得点も足す', () => {
    const field = createEmptyField()
    field[19] = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
    const state = stateWith({ type: 'I', rotation: 0, x: 0, y: 0 }, field)
    const next = play(state, { type: 'hardDrop', nextType: 'O' })
    expect(next.score).toBe(18 * 2 + 100)
    expect(next.lines).toBe(1)
  })

  test('ハードドロップでもゲームオーバーになる', () => {
    const field = createEmptyField()
    field[0]![4] = 1 // O の出現位置をふさぐ
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 10 }, field)
    const next = reducer(state, { type: 'hardDrop', nextType: 'O' })
    expect(next.status).toBe('gameover')
  })
})

describe('reducer: リスタート', () => {
  test('ゲームオーバーから restart すると、空のフィールドで最初から始まる', () => {
    const field = createEmptyField()
    field[19]![0] = 1
    const state: GameState = {
      status: 'gameover',
      field,
      score: 1200,
      lines: 12,
      level: 2,
    }
    const next = play(state, { type: 'restart', nextType: 'L' })
    expect(next).toEqual({
      status: 'playing',
      field: createEmptyField(),
      current: spawnPiece('L'),
      score: 0,
      lines: 0,
      level: 1,
    })
  })

  test('プレイ中の restart は何もしない', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 5 })
    expect(reducer(state, { type: 'restart', nextType: 'L' })).toBe(state)
  })
})

test('元の state を書き換えない', () => {
  const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 0 })
  const before = structuredClone(state)
  reducer(state, { type: 'right' })
  reducer(state, { type: 'rotateRight' })
  reducer(state, { type: 'tick', nextType: 'I' })
  reducer(
    { ...state, current: { ...state.current, y: 18 } },
    {
      type: 'tick',
      nextType: 'I',
    },
  )
  expect(state).toEqual(before)
})
