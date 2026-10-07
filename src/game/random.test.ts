import { describe, expect, test } from 'vitest'
import { nextRandom, seededRandom } from '@/game/random.ts'
import { drawPieceBag } from '@/game/bag.ts'
import { PIECE_TYPES } from '@/game/types.ts'

// count 個の値を取り出す
function take(random: () => number, count: number): number[] {
  return Array.from({ length: count }, () => random())
}

describe('seededRandom', () => {
  test('同じ seed なら、同じ値の列を返す', () => {
    expect(take(seededRandom(42), 20)).toEqual(take(seededRandom(42), 20))
  })

  test('違う seed なら、違う値の列を返す', () => {
    expect(take(seededRandom(1), 20)).not.toEqual(take(seededRandom(2), 20))
  })

  test('値は 0 以上 1 未満', () => {
    for (const value of take(seededRandom(7), 1000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('nextRandom', () => {
  test('同じ状態からは、何度呼んでも同じ値と同じ次の状態になる', () => {
    expect(nextRandom(123)).toEqual(nextRandom(123))
  })

  test('次の状態を渡していくと、seededRandom と同じ値の列になる', () => {
    let rng = 42
    const values: number[] = []
    for (let i = 0; i < 20; i++) {
      const [value, next] = nextRandom(rng)
      values.push(value)
      rng = next
    }
    expect(values).toEqual(take(seededRandom(42), 20))
  })
})

describe('drawPieceBag', () => {
  test('同じ rng からは同じ袋と同じ次の rng になる', () => {
    expect(drawPieceBag(42)).toEqual(drawPieceBag(42))
  })

  test('7 種類が 1 つずつ入っていて、rng が進む', () => {
    const { bag, rng } = drawPieceBag(42)
    expect(bag.toSorted()).toEqual([...PIECE_TYPES].toSorted())
    expect(rng).not.toBe(42)
  })

  test('返った rng を次に渡すと、違う袋が続く', () => {
    const first = drawPieceBag(42)
    const orders = new Set([first.bag.join('')])
    let rng = first.rng
    for (let i = 0; i < 20; i++) {
      const { bag, rng: next } = drawPieceBag(rng)
      orders.add(bag.join(''))
      rng = next
    }
    expect(orders.size).toBeGreaterThan(10)
  })
})
