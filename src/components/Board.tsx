import { getShape } from '@/game/piece.ts'
import type { Field, Piece } from '@/game/types.ts'

type Props = {
  field: Field
  current: Piece
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
    <div className="board">
      {overlay(field, current).map((row, y) =>
        row.map((cell, x) => (
          <div className="cell" data-cell={cell} key={`${y}-${x}`} />
        )),
      )}
    </div>
  )
}

export default Board
