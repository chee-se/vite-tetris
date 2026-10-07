import type { GameState } from '@/game/reducer.ts'
import logo from '@/assets/logo.svg'

// status ごとにフィールドへ重ねる表示。playing のときは何も重ねない
export const OVERLAYS: Record<
  Exclude<GameState['status'], 'playing'>,
  { title: string; message: string; image?: string }
> = {
  title: { title: 'TETRIS', message: 'Enter でスタート', image: logo },
  paused: { title: 'PAUSE', message: 'P / Esc で再開' },
  gameover: { title: 'GAME OVER', message: 'Enter でもう一度' },
}
