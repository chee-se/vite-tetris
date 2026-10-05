import type { Cell as CellValue } from '@/game/types.ts'
import styles from './Cell.module.css'

type Props = {
  cell: CellValue
  // true なら、空のマス（0）を背景色で塗らずに透明にする
  blank?: boolean
}

// マス 1 つ。Board と NextPiece の両方で使う
function Cell({ cell, blank = false }: Props) {
  return (
    <div
      className={styles.cell}
      data-cell={cell}
      data-blank={blank || undefined}
    />
  )
}

export default Cell
