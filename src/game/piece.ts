import { SHAPES } from './tetrominoes.ts'
import type { Field, Piece, Cell, Rotation } from './types.ts'

export const ROTATION_RIGHT: Record<Rotation, Rotation> = {
  0: 1,
  1: 2,
  2: 3,
  3: 0,
} as const satisfies Record<Rotation, Rotation>
export const ROTATION_LEFT: Record<Rotation, Rotation> = {
  0: 3,
  1: 0,
  2: 1,
  3: 2,
} as const satisfies Record<Rotation, Rotation>

// 形を時計回りに 90° 回したものを、新しい配列として返す（元の shape は書き換えない）
export function rotateClockwise(shape: Field): Field {
  const n = shape.length
  const rshape = shape.map((row) => [...row])
  shape.forEach((row, y) =>
    row.forEach((cell, x) => (rshape[x]![-y + n - 1] = cell)),
  )
  return rshape
}

// piece.rotation の回数だけ時計回りに回した形を返す
export function getShape(piece: Piece): Field {
  let shape = SHAPES[piece.type]
  for (let i = 0; i < piece.rotation; i++) {
    shape = rotateClockwise(shape)
  }
  return shape
}

// ミノがフィールドの外（壁・床・天井）にはみ出すか、固定ブロックと重なるなら true。
// 形の箱のうち空きマス（0）は、どこにあっても衝突しない
export function collides(field: Field, piece: Piece): boolean {
  const { x, y } = piece
  const shape = getShape(piece)

  const isCollision = (cell: Cell, cx: number, cy: number): boolean =>
    cell !== 0 && field[cy]?.[cx] !== 0

  return shape.some((row, dy) =>
    row.some((cell, dx) => isCollision(cell, x + dx, y + dy)),
  )
}
