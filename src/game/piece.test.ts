import { describe, expect, test } from 'vitest'
// vite.config.ts の設定（@/ のエイリアス）が、Vitest でもそのまま効く
import { createEmptyField } from '@/game/field.ts'
import {
  collides,
  getShape,
  dropToLand,
  rotateClockwise,
} from '@/game/piece.ts'
import { SHAPES } from '@/game/tetrominoes.ts'
import type { Piece } from '@/game/types.ts'

// T（rotation = 0）の形。x, y は箱の左上の位置
//   [0, 3, 0],
//   [3, 3, 3],
//   [0, 0, 0],
const t = (x: number, y: number): Piece => ({ type: 'T', rotation: 0, x, y })

describe('collides', () => {
  test('空のフィールドの中なら衝突しない', () => {
    expect(collides(createEmptyField(), t(3, 0))).toBe(false)
  })

  test('左右の壁にはみ出すと衝突する', () => {
    expect(collides(createEmptyField(), t(-1, 0))).toBe(true)
    expect(collides(createEmptyField(), t(8, 0))).toBe(true)
  })

  test('壁にぴったり接しているだけなら衝突しない', () => {
    expect(collides(createEmptyField(), t(0, 0))).toBe(false)
    expect(collides(createEmptyField(), t(7, 0))).toBe(false)
  })

  test('床にはみ出すと衝突する', () => {
    expect(collides(createEmptyField(), t(3, 19))).toBe(true)
  })

  test('箱の空きマスだけが床の外に出ていても衝突しない', () => {
    // 3 行目（すべて 0）が y = 20 にはみ出すが、ブロックは y = 19 まで
    expect(collides(createEmptyField(), t(3, 18))).toBe(false)
  })

  test('天井より上にはみ出すと衝突する', () => {
    expect(collides(createEmptyField(), t(3, -1))).toBe(true)
  })

  test('固定ブロックと重なると衝突する', () => {
    const field = createEmptyField()
    field[1]![4] = 1 // T の中心（箱の (1, 1)）の位置
    expect(collides(field, t(3, 0))).toBe(true)
  })

  test('固定ブロックが箱の空きマスの位置にあるだけなら衝突しない', () => {
    const field = createEmptyField()
    field[0]![3] = 1 // T の箱の左上（空きマス）の位置
    expect(collides(field, t(3, 0))).toBe(false)
  })

  test('回転した形で判定する', () => {
    // 縦向きの I は箱の 3 列目（dx = 2）だけにブロックがある
    const verticalI: Piece = { type: 'I', rotation: 1, x: -2, y: 0 }
    expect(collides(createEmptyField(), verticalI)).toBe(false)
    expect(collides(createEmptyField(), { ...verticalI, x: -3 })).toBe(true)
  })
})

describe('rotateClockwise', () => {
  test('T を時計回りに回す', () => {
    expect(rotateClockwise(SHAPES.T)).toEqual([
      [0, 3, 0],
      [0, 3, 3],
      [0, 3, 0],
    ])
  })

  test('I を時計回りに回す（4 × 4）', () => {
    expect(rotateClockwise(SHAPES.I)).toEqual([
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ])
  })

  test('O は回しても形が変わらない', () => {
    expect(rotateClockwise(SHAPES.O)).toEqual(SHAPES.O)
  })

  test('4 回回すと元に戻る', () => {
    const shape = SHAPES.L
    const rotated = rotateClockwise(
      rotateClockwise(rotateClockwise(rotateClockwise(shape))),
    )
    expect(rotated).toEqual(shape)
  })

  test('元の形を書き換えない', () => {
    const before = structuredClone(SHAPES.S)
    rotateClockwise(SHAPES.S)
    expect(SHAPES.S).toEqual(before)
  })
})

describe('dropToLand', () => {
  test('空のフィールドなら床の上まで落ちる', () => {
    // T のブロックは箱の 2 行目（dy = 1）まで。y = 18 なら床の行 19 に接する
    expect(dropToLand(createEmptyField(), t(3, 0))).toEqual(t(3, 18))
  })

  test('固定ブロックがあれば、その上で止まる', () => {
    const field = createEmptyField()
    field[10]![4] = 1 // T の中心の列（x = 4）の y = 10 にブロック
    expect(dropToLand(field, t(3, 0))).toEqual(t(3, 8))
  })

  test('すでに着地しているなら、同じ位置を返す', () => {
    expect(dropToLand(createEmptyField(), t(3, 18))).toEqual(t(3, 18))
  })

  test('回転した形で判定する', () => {
    // 縦向きの I は箱の 4 行すべてにブロックがある
    const verticalI: Piece = { type: 'I', rotation: 1, x: 3, y: 0 }
    expect(dropToLand(createEmptyField(), verticalI)).toEqual({
      ...verticalI,
      y: 16,
    })
  })

  test('元の piece を書き換えない', () => {
    const piece = t(3, 0)
    dropToLand(createEmptyField(), piece)
    expect(piece).toEqual(t(3, 0))
  })
})

describe('getShape', () => {
  test('rotation = 0 なら出現時の形', () => {
    expect(getShape(t(0, 0))).toEqual(SHAPES.T)
  })

  test('rotation = 2 なら上下逆さま', () => {
    expect(getShape({ type: 'T', rotation: 2, x: 0, y: 0 })).toEqual([
      [0, 0, 0],
      [3, 3, 3],
      [0, 3, 0],
    ])
  })
})
