import { describe, expect, test } from 'vitest'
import { createEmptyField } from '@/game/field.ts'
import { reducer, type GameState } from '@/game/reducer.ts'
import type { Piece } from '@/game/types.ts'

const stateWith = (current: Piece, field = createEmptyField()): GameState => ({
  field,
  current,
})

describe('reducer: 移動', () => {
  test('ぶつからなければ動く', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 0 })
    expect(reducer(state, { type: 'left' }).current.x).toBe(2)
    expect(reducer(state, { type: 'right' }).current.x).toBe(4)
    expect(reducer(state, { type: 'down' }).current.y).toBe(1)
  })

  test('移動しても向きは変わらない', () => {
    const state = stateWith({ type: 'T', rotation: 2, x: 3, y: 5 })
    expect(reducer(state, { type: 'left' }).current.rotation).toBe(2)
    expect(reducer(state, { type: 'down' }).current.rotation).toBe(2)
  })

  test('壁にぶつかるなら動かない', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 0, y: 0 })
    expect(reducer(state, { type: 'left' }).current).toEqual(state.current)
  })

  test('床にぶつかるなら動かない', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 18 })
    expect(reducer(state, { type: 'down' }).current).toEqual(state.current)
  })

  test('固定ブロックにぶつかるなら動かない', () => {
    const field = createEmptyField()
    field[2]![4] = 1 // T の 2 行目の真下
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 0 }, field)
    expect(reducer(state, { type: 'down' }).current).toEqual(state.current)
  })
})

describe('reducer: 回転', () => {
  test('右回転で rotation が 1 増え、3 の次は 0 に戻る', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 5 })
    expect(reducer(state, { type: 'rotateRight' }).current.rotation).toBe(1)
    const last = stateWith({ type: 'T', rotation: 3, x: 3, y: 5 })
    expect(reducer(last, { type: 'rotateRight' }).current.rotation).toBe(0)
  })

  test('左回転で rotation が 1 減り、0 の次は 3 に戻る', () => {
    const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 5 })
    expect(reducer(state, { type: 'rotateLeft' }).current.rotation).toBe(3)
  })

  test('回転後にぶつかるなら回転しない（壁蹴りなし）', () => {
    // 縦向きの I を左の壁に寄せた状態。横向きにすると左にはみ出す
    const state = stateWith({ type: 'I', rotation: 1, x: -2, y: 5 })
    expect(reducer(state, { type: 'rotateRight' }).current).toEqual(
      state.current,
    )
  })
})

test('元の state を書き換えない', () => {
  const state = stateWith({ type: 'T', rotation: 0, x: 3, y: 0 })
  const before = structuredClone(state)
  reducer(state, { type: 'right' })
  reducer(state, { type: 'rotateRight' })
  expect(state).toEqual(before)
})
