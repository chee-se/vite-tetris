import type { Preview } from '@storybook/react-vite'
// アプリでは main.tsx が読み込んでいるページ全体のスタイル（色や --cell-size の変数）。
// Storybook は main.tsx を通らないので、ここで読み込む
import '../src/index.css'

// すべての story に共通する、ブラウザ側の設定
const preview: Preview = {
  parameters: {
    // 部品を画面の中央に置く
    layout: 'centered',
  },
}

export default preview
