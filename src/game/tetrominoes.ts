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

// ランダムな順番で7種類ずつ排出する7-bagを作る
// random を省略すると Math.random を使うので純粋ではない。reducer の中ではなく、action を作る側（hooks）で呼ぶ。
// テストでは random に決まった値を返す関数を渡すと、順番を決められる
export function randomPieceBag(
  random: () => number = Math.random,
): PieceType[] {
  return shuffleArray(random, PIECE_TYPES)
}

function shuffleArray<T>(random: () => number, array: readonly T[]): T[] {
  const clone = [...array]
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[clone[i]!, clone[j]!] = [clone[j]!, clone[i]!] // 要素を入れ替える
  }
  return clone
}
