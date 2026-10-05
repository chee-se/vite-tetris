// spec.md の「スコア」「レベル」をそのまま式にしたもの

// 同時に消した行数（0〜4）ごとの基本点。レベルを掛けて使う
const LINE_CLEAR_POINTS = [0, 100, 300, 500, 800] as const

export function lineClearScore(cleared: number, level: number): number {
  return (LINE_CLEAR_POINTS[cleared] ?? 0) * level
}

// 合計ライン数から求めるレベル。10 ラインごとに 1 上がる
export function levelFor(lines: number): number {
  return Math.floor(lines / 10) + 1
}

// レベルごとの落下間隔（ミリ秒）。レベル 10 以降は 100ms で止まる
export function dropIntervalMs(level: number): number {
  return Math.max(100, 1000 - (level - 1) * 100)
}
