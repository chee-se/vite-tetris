import { SHAPES } from './tetrominoes.ts'
import type { Field, Piece, PieceType, Cell, Rotation } from './types.ts'
import { JLSTZ_KICKS, I_KICKS, isRotationChange, type Kick } from './srs.ts'

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

// piece をそのまま真下に落としたとき、最後に止まる位置にあるミノ。元の piece は書き換えない。
// ハードドロップとゴースト（着地予定の位置）を表すにも使う。
export function dropToLand(field: Field, piece: Piece): Piece {
  const result = { ...piece }
  while (!collides(field, { ...result, y: result.y + 1 })) {
    result.y += 1
  }
  return result
}

export function srsRotate(field: Field, piece: Piece, to: Rotation): Piece {
  const { x, y, rotation: from } = piece
  const kicks = srsRotationTable(piece.type, from, to)

  // 不明な回転はそのまま返す
  if (kicks === undefined) return piece

  const kick = kicks.find(
    ([dx, dy]) =>
      !collides(field, { ...piece, x: x + dx, y: y + dy, rotation: to }),
  )

  // 全ての回転が衝突するなら回転しない
  if (kick === undefined) return piece

  const [dx, dy] = kick
  return { ...piece, x: x + dx, y: y + dy, rotation: to }
}

function srsRotationTable(
  type: PieceType,
  from: Rotation,
  to: Rotation,
): readonly Kick[] | undefined {
  const key = `${from}>${to}`
  if (!isRotationChange(key)) return

  // O はキックしない
  if (type === 'O') return [[0, 0]]
  if (type === 'I') return I_KICKS[key]
  return JLSTZ_KICKS[key]
}
