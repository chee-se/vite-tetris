import { describe, expect, test } from 'vitest'
import { seededRandom } from '@/game/random.ts'
import { randomPieceBag } from '@/game/tetrominoes.ts'

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

  test('randomPieceBag に渡すと、同じ seed で同じ順番のバッグが続く', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    for (let i = 0; i < 10; i++) {
      expect(randomPieceBag(a)).toEqual(randomPieceBag(b))
    }
  })
})
