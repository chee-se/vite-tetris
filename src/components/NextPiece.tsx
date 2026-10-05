import type { PieceType } from '@/game/types.ts'
import { SHAPES } from '@/game/tetrominoes.ts'
import Cell from '@/components/Cell.tsx'
import styles from './NextPiece.module.css'

type Props = {
  type: PieceType
}

// 次に出るミノを表示する
function NextPiece({ type }: Props) {
  const shape = SHAPES[type]
  return (
    <section className={styles.next}>
      <h2 className={styles.label}>NEXT</h2>
      <div className={styles.frame}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${shape.length}, var(--cell-size))`,
          }}
        >
          {shape.map((row, y) =>
            row.map((cell, x) => (
              <Cell cell={cell} blank={true} key={`${y}-${x}`} />
            )),
          )}
        </div>
      </div>
    </section>
  )
}

export default NextPiece
