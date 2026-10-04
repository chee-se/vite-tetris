import { getShape } from './piece.ts'
import { SHAPES } from './tetrominoes.ts'
import type { Cell, Field, Piece, PieceType } from './types.ts'

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

// ミノをフィールドに書き込んだ、新しいフィールドを返す（元の field は書き換えない）。
// 形の空きマス（0）は書き込まない。呼び出す側は、ミノが衝突していないことを確認してから呼ぶ
export function lockPiece(field: Field, piece: Piece): Field {
  const { x, y } = piece
  const shape = getShape(piece)
  const pieceCellAt = (fx: number, fy: number): Cell =>
    shape[fy - y]?.[fx - x] ?? 0

  return field.map((row, fy) =>
    row.map((cell, fx) => pieceCellAt(fx, fy) || cell),
  )
}

// 新しいミノを、フィールド上部の中央（箱の幅で左右をそろえる）に出す
export function spawnPiece(type: PieceType): Piece {
  const size = SHAPES[type].length
  return { type, rotation: 0, x: Math.floor((FIELD_WIDTH - size) / 2), y: 0 }
}
