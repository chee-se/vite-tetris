import { nextRandom } from './random.ts'
import { PIECE_TYPES, type FullPieceBag } from './types.ts'

// 乱数の状態 rng から次の袋を作り、袋と進めた rng を返す。
// rng を値として受け取って返すので純粋。reducer の中で呼べる
export function drawPieceBag(rng: number): { bag: FullPieceBag; rng: number } {
  const [bag, next] = shuffleArray(rng, PIECE_TYPES)
  // PIECE_TYPES のシャッフル配列なので長さはFullPieceBagと同じ
  return { bag: bag as FullPieceBag, rng: next }
}

// array を Fisher–Yates でシャッフルした新しい配列と、進めた rng を返す。
// nextRandom と同じく、rng を受け取って返すので純粋
function shuffleArray<T>(
  rng: number,
  array: readonly T[],
): [result: T[], rng: number] {
  const ret = [...array]

  // current(最終 seed)は、クロージャで使い、返り値にもなる
  let current = rng
  const random = () => {
    const [v, next] = nextRandom(current)
    current = next
    return v
  }

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[ret[i], ret[j]] = [ret[j]!, ret[i]!]
  }
  return [ret, current]
}
