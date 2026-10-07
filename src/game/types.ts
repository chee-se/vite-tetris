// 0 = 空、1〜7 = ミノの種類（I, O, T, S, Z, J, L の順）
export type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

// field[y][x] でアクセスする。y = 0 が一番上の行
export type Field = Cell[][]

// 7種のミノを定義
export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const
export type PieceType = (typeof PIECE_TYPES)[number]
type AllPieceType<T> = { -readonly [K in keyof T]: PieceType }
// 長さ PIECE_TYPES.length の PieceType[] 型(準同型マップ型（homomorphic mapped type）」)
export type FullPieceBag = AllPieceType<typeof PIECE_TYPES>

export type Rotation = 0 | 1 | 2 | 3
export type Piece = {
  type: PieceType
  rotation: Rotation
  x: number
  y: number
}
