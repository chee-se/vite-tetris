import type { PieceType } from '@/game/types.ts'
import { SHAPES } from '@/game/tetrominoes.ts'
import Cell from '@/components/Cell.tsx'
import styles from './PiecePreview.module.css'

type Props = {
  type?: PieceType
  label: string
  disabled?: boolean
}

// 見出し付きの枠に、ミノを 1 つ表示する（HOLD と NEXT で使う）
function PiecePreview({ type, label, disabled }: Props) {
  const shape = type !== undefined ? SHAPES[type] : []
  const shapeLength = shape.length
  const trimmedShape = shape.filter((row) => row.some((cell) => cell !== 0))
  return (
    <section className={styles.preview}>
      <h2 className={styles.label}>{label}</h2>
      <div className={styles.frame} data-disabled={disabled || undefined}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${shapeLength}, var(--cell-size))`,
          }}
        >
          {trimmedShape.map((row, y) =>
            row.map((cell, x) => (
              <Cell cell={cell} blank={true} key={`${y}-${x}`} />
            )),
          )}
        </div>
      </div>
    </section>
  )
}

export default PiecePreview
