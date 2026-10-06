import { describe, expect, test } from 'vitest'
import { createEmptyField } from '@/game/field.ts'
import {
  reducer,
  createTitleState,
  type Action,
  type GameState,
} from '@/game/reducer.ts'
import { randomPieceBag } from '@/game/tetrominoes.ts'
import { PIECE_TYPES, type PieceType } from '@/game/types.ts'

// タイトル画面の state を作る。
function titleState(): GameState {
  return createTitleState(randomPieceBag())
}

// type の action を作る。hooks と同じ作り方にする。
function makeAction(type: 'start' | 'hardDrop' | 'pause'): Action {
  if (type === 'pause') return { type }
  return { type: type, nextBag: randomPieceBag() }
}

const sortedTypes = [...PIECE_TYPES].toSorted()

function send(state: GameState, type: 'start' | 'hardDrop' | 'pause') {
  return reducer(state, makeAction(type))
}

function currentType(state: GameState): PieceType {
  if (state.status !== 'playing')
    throw new Error(`playing ではない: ${state.status}`)
  return state.current.type
}

// プレイ中の state から、出てきたミノを順に count 個集める（今の current を含む）。
// ハードドロップで次々にミノを出す。積み上がってゲームオーバーにならないよう、毎回フィールドを空にする。
// between は、ハードドロップの合間に毎回送る action（無視されるはずのもの）
function collect(
  state: GameState,
  count: number,
  between: ('start' | 'hardDrop' | 'pause')[] = [],
): PieceType[] {
  const pieces: PieceType[] = [currentType(state)]
  while (pieces.length < count) {
    for (const type of between) state = send(state, type)
    state = send({ ...state, field: createEmptyField() }, 'hardDrop')
    pieces.push(currentType(state))
  }
  return pieces
}

// 新しいゲームを始め、出てきたミノを順に count 個集める
function takePieces(
  count: number,
  between: ('start' | 'hardDrop' | 'pause')[] = [],
): PieceType[] {
  return collect(send(titleState(), 'start'), count, between)
}

// pieces を 7 個ずつに区切る（端数は捨てる）
function chunksOf7(pieces: PieceType[]): PieceType[][] {
  return Array.from({ length: Math.floor(pieces.length / 7) }, (_, i) =>
    pieces.slice(i * 7, i * 7 + 7),
  )
}

describe('randomPieceBag', () => {
  test('7 種類が 1 つずつ入っている', () => {
    expect(randomPieceBag().toSorted()).toEqual(sortedTypes)
  })

  test('呼ぶたびにシャッフルされる', () => {
    const orders = new Set(
      Array.from({ length: 100 }, () => randomPieceBag().join('')),
    )
    expect(orders.size).toBeGreaterThan(50)
  })
})

describe('7-bag（reducer でミノを出す）', () => {
  test('7 個ずつ区切ると、どの区切りにも 7 種類が 1 つずつ入っている', () => {
    for (const chunk of chunksOf7(takePieces(700))) {
      expect(chunk.toSorted()).toEqual(sortedTypes)
    }
  })

  test('同じミノの間隔は最大でも 12 個', () => {
    // 袋の先頭で出て、次の袋の最後で出るときが一番間が空く（間に 12 個）
    const pieces = takePieces(700)
    for (const type of PIECE_TYPES) {
      const positions = pieces.flatMap((p, i) => (p === type ? [i] : []))
      positions.slice(1).forEach((pos, i) => {
        expect(pos - positions[i]! - 1).toBeLessThanOrEqual(12)
      })
    }
  })

  test('最初に出るミノはどの種類にも偏らない', () => {
    // 新しいゲームを 7000 回始めて、最初の 1 個を数える。各種類 平均 1000 回
    const counts = new Map<PieceType, number>()
    for (let i = 0; i < 7000; i++) {
      const [first] = takePieces(1)
      counts.set(first!, (counts.get(first!) ?? 0) + 1)
    }
    expect(counts.size).toBe(7)
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(800)
      expect(count).toBeLessThan(1200)
    }
  })
})

describe('無視される action では袋が減らない', () => {
  test('タイトル画面でハードドロップを押しても、最初の袋は 7 種類そろっている', () => {
    let state = titleState()
    for (let i = 0; i < 5; i++) state = send(state, 'hardDrop')
    const pieces = collect(send(state, 'start'), 7)
    expect(pieces.toSorted()).toEqual(sortedTypes)
  })

  test('プレイ中に Enter（start）を押しても、7 個ずつの区切りは崩れない', () => {
    for (const chunk of chunksOf7(takePieces(70, ['start', 'start']))) {
      expect(chunk.toSorted()).toEqual(sortedTypes)
    }
  })

  test('一時停止中にハードドロップを押しても、7 個ずつの区切りは崩れない', () => {
    const between = ['pause', 'hardDrop', 'hardDrop', 'pause'] as const
    for (const chunk of chunksOf7(takePieces(70, [...between]))) {
      expect(chunk.toSorted()).toEqual(sortedTypes)
    }
  })
})

describe('reducer が純粋である', () => {
  // StrictMode は開発中、reducer も 2 回呼ぶ。state の中の配列を書き換えると、2 回目の結果が変わる
  test('同じ state と action で 2 回呼んでも、同じ結果になり、元の state も変わらない', () => {
    let state = send(titleState(), 'start')
    for (let i = 0; i < 20; i++) {
      const cleared = { ...state, field: createEmptyField() }
      const before = structuredClone(cleared)
      const action = makeAction('hardDrop')
      const first = reducer(cleared, action)
      const second = reducer(cleared, action)
      expect(second).toEqual(first)
      expect(cleared).toEqual(before)
      state = first
    }
  })
})

describe('リスタート', () => {
  test('ゲームオーバーから start すると新しい袋から始まり、最初の 7 個に 7 種類がそろう', () => {
    // 前のゲームの袋の進み具合を変えながら、何度も試す
    for (let used = 0; used < 7; used++) {
      for (let trial = 0; trial < 20; trial++) {
        let state = send(titleState(), 'start')
        for (let i = 0; i < used; i++) {
          state = send({ ...state, field: createEmptyField() }, 'hardDrop')
        }
        if (state.status !== 'playing') throw new Error(state.status)
        const { current: _, ...rest } = state
        const gameover: GameState = { ...rest, status: 'gameover' }
        const pieces = collect(send(gameover, 'start'), 7)
        expect(pieces.toSorted()).toEqual(sortedTypes)
      }
    }
  })
})
