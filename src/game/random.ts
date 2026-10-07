// seed から、Math.random と同じ形（0 以上 1 未満を返す）の乱数の関数を作る。
// 同じ seed なら、何度作っても同じ値の列を返す。E2E でミノの順番を決めるために使う。
// アルゴリズムは mulberry32（32 ビットの状態を持つ、短くて速い疑似乱数）。暗号には使えない
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
