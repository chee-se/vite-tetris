import type { PieceType } from '@/game/types.ts'
import styles from './NextPiece.module.css'

type Props = {
  type: PieceType
}

// 次に出るミノを表示する
function NextPiece({ type }: Props) {
  return (
    <section className={styles.next}>
      <h2 className={styles.label}>NEXT</h2>
      <div className={styles.frame}>
        {/* TODO(human): SHAPES[type] の形を、Cell を並べて styles.grid の中に描く */}
        {type}
      </div>
    </section>
  )
}

export default NextPiece
