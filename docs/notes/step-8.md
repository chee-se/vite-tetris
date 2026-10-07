# Step 8: テストの拡充と Storybook

## 分かったこと

- @vitest/browser-playwright: Vitest が本物のブラウザを起動して操作するための provider
- playwright: 上の provider が実際に使うブラウザ自動操作ライブラリ
- vitest-browser-react: React コンポーネントをブラウザの中で render するためのもの
- @playwright/test: Nodejs から playwright でテストするテストランナー（E2E）
- storybook: componentのカタログ
- @storybook/react-vite: storybook で React コンポーネントを描画、vite で動かす

- vitest は失敗時のスクリーンショットを保存している
- Locator は「探し方」で、値ではなく、async でもないので、変数に入れて使い回せる
- evaluateAll でスナップショットを取る
- expect.poll（値の検証が通るまで繰り返す）
- await expect(locator)（DOM の検証が通るまで繰り返す）
- expect.poll の await 忘れが lint では見つからなかった件
- 「変わらない」ことのテストは検出しにくいので、間に検出できる検証を入れて変わっていないことを確実に見る
- page.clock.install() のあとも時間は流れる

## ハマったこと

- await 抜け、余分なawait。（oxlint-tsgolintを導入）

## まだ分からないこと

- 