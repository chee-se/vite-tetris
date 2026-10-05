import styles from './Overlay.module.css'

type Props = {
  title: string
  message: string
}

// フィールドの上に重ねる表示（タイトル・一時停止・ゲームオーバー）
function Overlay({ title, message }: Props) {
  return (
    <div className={styles.overlay}>
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
    </div>
  )
}

export default Overlay
