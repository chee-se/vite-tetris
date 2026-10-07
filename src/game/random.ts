// 乱数の状態（32 ビットの整数）を受け取り、0 以上 1 未満の値と、進めた状態を返す。
// 状態を値として持ち運ぶので純粋。同じ状態からは、何度呼んでも同じ値が出る。
// アルゴリズムは mulberry32（32 ビットの状態を持つ、短くて速い疑似乱数）。暗号には使えない
export function nextRandom(rng: number): [value: number, rng: number] {
  const next = (rng + 0x6d2b79f5) >>> 0
  let t = next
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next]
}

// seed から、Math.random と同じ形（0 以上 1 未満を返す）の乱数の関数を作る。
// 中で状態を書き換えるので、呼ぶたびに違う値を返す
export function seededRandom(seed: number): () => number {
  let rng = seed >>> 0
  return () => {
    const [value, next] = nextRandom(rng)
    rng = next
    return value
  }
}

// 新しいゲームの seed を Math.random から作る。開発時に URL の ?seed= がないときに使う
export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32)
}
