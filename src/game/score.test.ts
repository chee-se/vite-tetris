import { describe, expect, test } from 'vitest'
import { dropIntervalMs, levelFor, lineClearScore } from '@/game/score.ts'

describe('lineClearScore', () => {
  test('消した行数ごとの基本点にレベルを掛ける', () => {
    expect(lineClearScore(0, 1)).toBe(0)
    expect(lineClearScore(1, 1)).toBe(100)
    expect(lineClearScore(2, 1)).toBe(300)
    expect(lineClearScore(3, 1)).toBe(500)
    expect(lineClearScore(4, 1)).toBe(800)
    expect(lineClearScore(4, 3)).toBe(2400)
  })
})

describe('levelFor', () => {
  test('10 ラインごとに 1 上がる', () => {
    expect(levelFor(0)).toBe(1)
    expect(levelFor(9)).toBe(1)
    expect(levelFor(10)).toBe(2)
    expect(levelFor(25)).toBe(3)
  })
})

describe('dropIntervalMs', () => {
  test('レベルが上がるほど短くなり、100ms より短くはならない', () => {
    expect(dropIntervalMs(1)).toBe(1000)
    expect(dropIntervalMs(2)).toBe(900)
    expect(dropIntervalMs(10)).toBe(100)
    expect(dropIntervalMs(15)).toBe(100)
  })
})
