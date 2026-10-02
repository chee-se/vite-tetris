// 0 = 空、1〜7 = ミノの種類（I, O, T, S, Z, J, L の順）
export type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

// field[y][x] でアクセスする。y = 0 が一番上の行
export type Field = Cell[][]
