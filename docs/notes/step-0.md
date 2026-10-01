# Step 0:

- tsconfigをサーバーとクライアントで書き分ける。\`tsc -b\` でプロジェクトごとのチェックがかかる。
- Vite を使うときは \`noEmit\`。Viteにビルドさせる。
- 前回のビルド結果を記録しておくには \`incremental: true\`. noEmit でも buildinfo に記録される。

 