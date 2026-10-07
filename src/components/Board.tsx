import Cell from '@/components/Cell.tsx'
import { getShape, dropToLand } from '@/game/piece.ts'
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
  const ghost = current ? overlay(field, dropToLand(field, current)) : field
  const cells = current ? overlay(field, current) : field
  return (
    // data-testid は E2E でフィールドを探すための目印（page.getByTestId('board')）
    <div className={styles.board} data-testid="board">
      {cells.map((row, y) =>
        row.map((cell, x) => {
          const ghostCell = ghost[y]?.[x] ?? 0
          // cell が 0 なら固定ブロックも落下中のミノもないので、ゴーストのマスならゴーストを表示する
          return (
            <Cell
              cell={cell !== 0 ? cell : ghostCell}
              ghost={cell === 0 && ghostCell !== 0}
              key={`${y}-${x}`}
            />
          )
        }),
      )}
    </div>
  )
}

export default Board
