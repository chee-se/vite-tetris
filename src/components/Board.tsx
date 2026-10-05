import Cell from '@/components/Cell.tsx'
import { getShape } from '@/game/piece.ts'
import type { Field, Piece } from '@/game/types.ts'
import styles from './Board.module.css'

type Props = {
  field: Field
  // ゲームオーバー中は落下中のミノがないので、渡さない
  current?: Piece
}

// 固定済みのフィールドに落下中のミノを重ねた、描画用のコピーを作る。
// 元の field は書き換えない（ミノの位置は state の current だけが持つ）
function overlay(field: Field, piece: Piece): Field {
  const result = field.map((row) => [...row])
  getShape(piece).forEach((shapeRow, dy) => {
    shapeRow.forEach((cell, dx) => {
      const row = result[piece.y + dy]
      const x = piece.x + dx
      // 形の空きマスと、フィールドの外にはみ出たマスは描かない
      if (cell !== 0 && row !== undefined && x >= 0 && x < row.length) {
        row[x] = cell
      }
    })
  })
  return result
}

function Board({ field, current }: Props) {
  return (
    <div className={styles.board}>
      {(current ? overlay(field, current) : field).map((row, y) =>
        row.map((cell, x) => <Cell cell={cell} key={`${y}-${x}`} />),
      )}
    </div>
  )
}

export default Board
