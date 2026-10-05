# Step 6: NEXT 表示・タイトル / 一時停止画面・見た目の調整

## 分かったこと

- tsx内ではjsxタグをそのまま書ける。jsx内ではts処理を`{...}`で囲む。互いに入れ子の構造にでき、深い階層の入れ子もできる
- `return` で改行したいときは、jsxタグを`(...)`で囲む。(`return;`と解釈されることの防止)
- cssやsvgをimportして使用できる。class名はファイルごと（`*.module.css`）に独立して衝突しない。CSS変数はそのまま使える
- importされた画像は、4KiB未満の場合、data URI として埋め込まれる（vite.config.ts の build.assetsInlineLimit で設定。import に ?no-inline をつけると抑止できる）
- public はそのまま公開される。import したassetsはハッシュを付与してモジュールグラフに入る

## ハマったこと

- jsx内で`const`は書けない。式のみ。宣言は関数本体に書く。 

## まだ分からないこと

- なし