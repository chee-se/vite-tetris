# Step 1: 

## 分かったこと

- `forEach` は `void` を返すので描画に使えない。JSX に並べるときは配列を返す `map` を使う。

- ループで兄弟要素を作ったら `key` をつける。差分検出用。
- 入れ子の `map` は配列の配列を返すが、React が平らにして描画する。行を `div` で囲まなくても、CSS Grid の `repeat(10, …)` が 10 個ごとに折り返す。
- 色は `data-cell` 属性と CSS で付ける。ロジックは 0〜7 の数値しか知らない。
- `verbatimModuleSyntax` があるので、型だけの import は `import type`。`erasableSyntaxOnly` で `enum` は使えないので、`Cell` は union 型。
- CSS の HMR は `<style>` の中身を入れ替えるだけ。ページは再読み込みされない。
- `function` とアロー関数は大部分が好み。トップレベルは `function`、コールバックはアロー関数にする。

## ハマったこと

- 最初 `forEach` で書いて何も表示されなかった（`Type 'void' is not assignable to type 'ReactNode'`）。

## まだ分からないこと

- React Fast Refresh で状態が保たれる様子（Step 2 で `useReducer` を入れたら確かめる）。