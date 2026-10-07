import { describe, expect, test } from 'vitest'
import { createEmptyField } from '@/game/field.ts'
import { collides } from '@/game/piece.ts'
import { reducer, type Action, type GameState } from '@/game/reducer.ts'
import type { Cell, Field, Piece } from '@/game/types.ts'

type PlayingState = Extract<GameState, { status: 'playing' }>

const stateWith = (
  current: Piece,
  field = createEmptyField(),
): PlayingState => ({
  status: 'playing',
  field,
  current,
  next: 'O',
  bag: ['I', 'T', 'S'],
  rng: 1,
  score: 0,
  lines: 0,
  level: 1,
  canHold: true,
})

// 回転させて、結果のミノを返す
function rotate(
  current: Piece,
  direction: 'rotateRight' | 'rotateLeft',
  field?: Field,
): Piece {
  const action: Action = { type: direction }
  const next = reducer(stateWith(current, field), action)
  if (next.status !== 'playing') throw new Error(`status が ${next.status}`)
  return next.current
}

// 位置はミノの箱の左上。形は次のとおり（rotation ごと）
//   T 0: .T.   T 1: .T.   T 2: ...   T 3: .T.
//        TTT        .TT        TTT        TT.
//        ...        .T.        .T.        .T.
describe('SRS: ぶつからなければその場で回る（1 つ目の候補 [0, 0]）', () => {
  test('広い場所なら、位置を変えずに向きだけ変わる', () => {
    const t: Piece = { type: 'T', rotation: 0, x: 3, y: 5 }
    expect(rotate(t, 'rotateRight')).toEqual({ ...t, rotation: 1 })
    expect(rotate(t, 'rotateLeft')).toEqual({ ...t, rotation: 3 })
  })

  test('O は回しても位置が変わらない', () => {
    const o: Piece = { type: 'O', rotation: 0, x: 4, y: 18 }
    expect(rotate(o, 'rotateRight')).toEqual({ ...o, rotation: 1 })
  })
})

describe('SRS: J, L, S, T, Z の壁蹴り', () => {
  test('左の壁際で回すと、右に 1 マスずれる（1>2 の 2 つ目の候補 [1, 0]）', () => {
    // 縦向きの T（rotation 1）の軸を x = 0 の列に置く。横向きにすると左にはみ出す
    const t: Piece = { type: 'T', rotation: 1, x: -1, y: 5 }
    expect(rotate(t, 'rotateRight')).toEqual({
      type: 'T',
      rotation: 2,
      x: 0,
      y: 5,
    })
  })

  test('右の壁際で左回転すると、左に 1 マスずれる（3>2 の 2 つ目の候補 [-1, 0]）', () => {
    // rotation 3 の T の軸を x = 9 の列に置く
    const t: Piece = { type: 'T', rotation: 3, x: 8, y: 5 }
    expect(rotate(t, 'rotateLeft')).toEqual({
      type: 'T',
      rotation: 2,
      x: 7,
      y: 5,
    })
  })

  test('床で回すと、上に持ち上がる（0>1 の 3 つ目の候補 [-1, -1]）', () => {
    // 横向きの T を床に置く。縦向きにすると床の下にはみ出す。
    // 2 つ目の候補 [-1, 0] も床にはみ出すので、3 つ目で 1 マス上がる
    const t: Piece = { type: 'T', rotation: 0, x: 3, y: 18 }
    expect(rotate(t, 'rotateRight')).toEqual({
      type: 'T',
      rotation: 1,
      x: 2,
      y: 17,
    })
  })

  test('前の候補がブロックにふさがれていたら、次の候補を試す', () => {
    // 左の壁際の T（上のテストと同じ）。2 つ目の候補 [1, 0] の位置をブロックでふさぐと、
    // 3 つ目の候補 [1, 1]（右に 1、下に 1）になる
    const field = createEmptyField()
    field[6]![2] = 1 // 2 つ目の候補では T の右端（x = 2, y = 6）になるマス
    const t: Piece = { type: 'T', rotation: 1, x: -1, y: 5 }
    expect(rotate(t, 'rotateRight', field)).toEqual({
      type: 'T',
      rotation: 2,
      x: 0,
      y: 6,
    })
  })
})

describe('SRS: I の壁蹴り（I だけ別の表）', () => {
  // I の形は 4 × 4 の箱。rotation 0 は 2 行目、1 は 3 列目、2 は 3 行目、3 は 2 列目にブロックが並ぶ
  test('左の壁際で縦から横に回すと、右に 2 マスずれる（1>2 の 3 つ目の候補 [2, 0]）', () => {
    // 縦向きの I（rotation 1）を左の壁に寄せる（ブロックは x = 0 の列）
    const i: Piece = { type: 'I', rotation: 1, x: -2, y: 5 }
    expect(rotate(i, 'rotateRight')).toEqual({
      type: 'I',
      rotation: 2,
      x: 0,
      y: 5,
    })
  })

  test('床で横から縦に回すと、上に持ち上がる（2>3 の 4 つ目の候補 [2, -1]）', () => {
    // rotation 2 の I（ブロックは箱の 3 行目）を床に置く（ブロックは y = 19 の行）
    const i: Piece = { type: 'I', rotation: 2, x: 3, y: 17 }
    expect(rotate(i, 'rotateRight')).toEqual({
      type: 'I',
      rotation: 3,
      x: 5,
      y: 16,
    })
  })
})

describe('SRS: どの候補でもぶつかるなら回転しない', () => {
  test('ミノのまわりがすべて埋まっていれば、回転しない', () => {
    // 今の T のマスだけを空けて、ほかをすべて埋める
    const t: Piece = { type: 'T', rotation: 0, x: 3, y: 5 }
    const field: Field = createEmptyField().map((row) => row.map((): Cell => 1))
    for (const [x, y] of [
      [4, 5],
      [3, 6],
      [4, 6],
      [5, 6],
    ] as const) {
      field[y]![x] = 0
    }
    expect(collides(field, t)).toBe(false)
    expect(rotate(t, 'rotateRight', field)).toEqual(t)
    expect(rotate(t, 'rotateLeft', field)).toEqual(t)
  })
})
