import type { Field } from '@/game/types.ts'

type Props = {
  field: Field
}

function Board({ field }: Props) {
  return (
    <div className="board">
      {field.map((row, y) =>
        row.map((cell, x) =>
          <div className="cell" data-cell={cell} key={`${y}-${x}`} />
        )
      )}
    </div>
  )
}

export default Board
