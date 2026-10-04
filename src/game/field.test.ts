import { describe, expect, test } from 'vitest'
import {
  createEmptyField,
  FIELD_HEIGHT,
  lockPiece,
  spawnPiece,
} from '@/game/field.ts'
import type { Piece } from '@/game/types.ts'

describe('lockPiece', () => {
  test('ミノのブロックがフィールドに書き込まれる', () => {
    // T（rotation = 0）を床に置く。箱の 3 行目は空きマスなので y = 18 で床に接する
    const piece: Piece = { type: 'T', rotation: 0, x: 3, y: 18 }
    const field = lockPiece(createEmptyField(), piece)
    expect(field[18]).toEqual([0, 0, 0, 0, 3, 0, 0, 0, 0, 0])
    expect(field[19]).toEqual([0, 0, 0, 3, 3, 3, 0, 0, 0, 0])
  })

  test('回転した形で書き込まれる', () => {
    // 縦向きの I は箱の 3 列目（dx = 2）だけにブロックがある
    const piece: Piece = { type: 'I', rotation: 1, x: -2, y: 16 }
    const field = lockPiece(createEmptyField(), piece)
    for (let y = 16; y < FIELD_HEIGHT; y++) {
      expect(field[y]![0]).toBe(1)
    }
  })

  test('箱の空きマスは、すでにあるブロックを消さない', () => {
    const field = createEmptyField()
    field[18]![3] = 6 // T の箱の左上（空きマス）の位置
    const piece: Piece = { type: 'T', rotation: 0, x: 3, y: 18 }
    expect(lockPiece(field, piece)[18]![3]).toBe(6)
  })

  test('元のフィールドを書き換えない', () => {
    const field = createEmptyField()
    const before = structuredClone(field)
    lockPiece(field, { type: 'O', rotation: 0, x: 4, y: 18 })
    expect(field).toEqual(before)
  })
})

describe('spawnPiece', () => {
  test('上部の中央に、出現時の向きで出る', () => {
    expect(spawnPiece('T')).toEqual({ type: 'T', rotation: 0, x: 3, y: 0 })
  })

  test('箱の大きさが違っても中央にそろう', () => {
    expect(spawnPiece('I').x).toBe(3) // 4 × 4
    expect(spawnPiece('O').x).toBe(4) // 2 × 2
  })
})
