import styles from './Overlay.module.css'

type Props = {
  title: string
  message: string
  // 画像の URL。import した画像でも、public/ の絶対パスでもよい
  image?: string
}

// フィールドの上に重ねる表示（タイトル・一時停止・ゲームオーバー）
function Overlay({ title, message, image }: Props) {
  return (
    <div className={styles.overlay}>
      {image && <img className={styles.image} src={image} alt="" />}
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
    </div>
  )
}

export default Overlay
