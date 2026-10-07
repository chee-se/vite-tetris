import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import Stats from '@/components/Stats.tsx'

test('スコア・ライン数・レベルを表示する', async () => {
  // render は描画が終わるまで待つので await する
  const screen = await render(<Stats score={1200} lines={8} level={2} />)

  // dl の dt / dd は、それぞれ role が term / definition になる。
  // 見た目（クラス名）ではなく、意味（role と表示される文字）で要素を探す
  await expect
    .element(screen.getByRole('term').nth(0))
    .toHaveTextContent('SCORE')
  await expect
    .element(screen.getByRole('definition').nth(0))
    .toHaveTextContent('1200')
  await expect
    .element(screen.getByRole('definition').nth(1))
    .toHaveTextContent('8')
  await expect
    .element(screen.getByRole('definition').nth(2))
    .toHaveTextContent('2')
})
