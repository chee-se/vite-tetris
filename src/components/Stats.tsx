import styles from './Stats.module.css'

type Props = {
  score: number
  lines: number
  level: number
}

function Stats({ score, lines, level }: Props) {
  return (
    <dl className={styles.stats}>
      <dt>SCORE</dt>
      <dd>{score}</dd>
      <dt>LINES</dt>
      <dd>{lines}</dd>
      <dt>LEVEL</dt>
      <dd>{level}</dd>
    </dl>
  )
}

export default Stats
