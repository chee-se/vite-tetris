import { getShape } from './piece.ts'
import { SHAPES } from './tetrominoes.ts'
import type { Cell, Field, Piece, PieceType } from './types.ts'

export const FIELD_WIDTH = 10
export const FIELD_HEIGHT = 20

function createEmptyRow(): Cell[] {
  return Array.from({ length: FIELD_WIDTH }, (): Cell => 0)
}

export function createEmptyField(): Field {
  return Array.from({ length: FIELD_HEIGHT }, () => createEmptyRow())
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

// そろった行（空きマスが 1 つもない行）を消し、上の行を下にずらしたフィールドと、消した行数を返す。
// 元の field は書き換えない。返すフィールドも FIELD_HEIGHT 行のまま
export function clearLines(field: Field): { field: Field; cleared: number } {
  const remaining = field.filter((row) => row.includes(0))
  const cleared = FIELD_HEIGHT - remaining.length
  const empties = Array.from({ length: cleared }, () => createEmptyRow())

  return { field: [...empties, ...remaining], cleared }
}

// 新しいミノを、フィールド上部の中央（箱の幅で左右をそろえる）に出す
export function spawnPiece(type: PieceType): Piece {
  const size = SHAPES[type].length
  return { type, rotation: 0, x: Math.floor((FIELD_WIDTH - size) / 2), y: 0 }
}
