import { describe, expect, test } from 'vitest'
import {
  clearLines,
  createEmptyField,
  FIELD_HEIGHT,
  lockPiece,
  spawnPiece,
} from '@/game/field.ts'
import type { Cell, Piece } from '@/game/types.ts'

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

describe('clearLines', () => {
  const FULL: Cell[] = [1, 2, 3, 4, 5, 6, 7, 1, 2, 3]
  const HOLE: Cell[] = [1, 1, 1, 1, 0, 1, 1, 1, 1, 1]
  const EMPTY: Cell[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  // 下から順に行を積んだフィールドを作る（rows[0] が一番下の行）
  const stack = (...rows: Cell[][]) => {
    const field = createEmptyField()
    rows.forEach((row, i) => {
      field[FIELD_HEIGHT - 1 - i] = [...row]
    })
    return field
  }

  test('そろった行がなければ、何も消えない', () => {
    const field = stack(HOLE, HOLE)
    const result = clearLines(field)
    expect(result.cleared).toBe(0)
    expect(result.field).toEqual(field)
  })

  test('そろった行を消し、上の行が 1 段下がる', () => {
    const result = clearLines(stack(FULL, HOLE))
    expect(result.cleared).toBe(1)
    expect(result.field).toEqual(stack(HOLE))
  })

  test('離れた複数の行を同時に消す', () => {
    const top: Cell[] = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const result = clearLines(stack(FULL, HOLE, FULL, top))
    expect(result.cleared).toBe(2)
    expect(result.field).toEqual(stack(HOLE, top))
  })

  test('4 行同時に消せる（テトリス）', () => {
    const result = clearLines(stack(FULL, FULL, FULL, FULL, HOLE))
    expect(result.cleared).toBe(4)
    expect(result.field).toEqual(stack(HOLE))
  })

  test('消した後も 10 × 20 のまま。上には空の行が入る', () => {
    const result = clearLines(stack(FULL, FULL))
    expect(result.field).toHaveLength(FIELD_HEIGHT)
    expect(result.field[0]).toEqual(EMPTY)
    expect(result.field).toEqual(createEmptyField())
  })

  test('元の field を書き換えない', () => {
    const field = stack(FULL, HOLE)
    const before = structuredClone(field)
    clearLines(field)
    expect(field).toEqual(before)
  })
})
