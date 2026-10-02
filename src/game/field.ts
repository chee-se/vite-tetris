import type { Cell, Field } from './types.ts'

export const FIELD_WIDTH = 10
export const FIELD_HEIGHT = 20

export function createEmptyField(): Field {
  return Array.from({ length: FIELD_HEIGHT }, () =>
    Array.from({ length: FIELD_WIDTH }, (): Cell => 0),
  )
}

// Step 1 の表示確認用の固定データ。下の数行にブロックが積まれた状態
export function createSampleField(): Field {
  const field = createEmptyField()
  const bottom: Cell[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 3, 0, 0, 0, 0, 5, 5, 0, 1],
    [3, 3, 3, 0, 2, 2, 0, 5, 5, 1],
    [6, 4, 4, 0, 2, 2, 7, 7, 7, 1],
    [6, 6, 6, 4, 4, 0, 7, 1, 1, 1],
  ]
  bottom.forEach((row, i) => {
    field[FIELD_HEIGHT - bottom.length + i] = row
  })
  return field
}
