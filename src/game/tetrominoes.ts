import { PIECE_TYPES, type Field, type PieceType } from './types.ts'

// 出現時（rotation = 0）の形。回転しても箱の大きさが変わらないよう正方形で持つ
// Record<PieceType, Field> は { [K in PieceType]: Field } と同じ。どれかが抜けると型エラーになる
export const SHAPES: Record<PieceType, Field> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [2, 2],
    [2, 2],
  ],
  T: [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ],
  S: [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ],
  Z: [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ],
  J: [
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0],
  ],
}

// 7 種類から 1 つを等確率で選ぶ（7-bag は Step 7 の発展要素）。
// 乱数を使うので純粋ではない。reducer の中ではなく、action を作る側（hooks）で呼ぶ
export function randomPieceType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)] ?? 'I'
}
