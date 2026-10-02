# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクトの目的

Vite の学習を目的として、テトリスをステップごとに作るプロジェクト。完成を急ぐより、各ステップで Vite / React / TypeScript の仕組みを理解することを重視する。

- 仕様: `docs/spec.md`（技術方針・ゲームのルール・操作・状態遷移）
- 実装計画: `docs/plan.md`（Step 0〜8、各ステップの完了条件と進み具合）

作業は `docs/plan.md` のステップ順に進める。ステップが終わったら、表の「状態」列を更新する。仕様を変えたときは `docs/spec.md` も合わせて直す。

## 学習のための約束（`docs/plan.md` の「進め方」も参照）

- **`src/game/` のロジック、型定義、カスタムフックの中心部分は学習者が書く。** Claude はここを完成させず、関数のシグネチャ・テスト・`TODO(human)` を用意して学習者に渡す。雛形・CSS・設定ファイル・テストの土台は Claude が書いてよい。
- 状態管理ライブラリや CSS フレームワークなど、新しい依存は学習者が理由を説明できるまで追加しない。
- 学習メモ（`docs/notes/step-N.md`）は学習者が自分で書く。Claude は代わりに書かず、ステップを終えるときに書いたかどうかを確認する。
- Git: 最初のコミット以外は、ブランチ `step-N/<内容>` → PR → `main` にマージ、の順で進める。

## コマンド

```sh
npm run dev      # 開発サーバー（http://localhost:5173、HMR あり）
npm run build    # tsc -b で型チェック → vite build
npm run lint     # oxlint（ESLint ではない）
npm run fmt      # oxfmt で整形（fmt:check は確認だけ）。Markdown は対象外
npm run preview  # ビルド結果をローカルで配信
```

Vite は型を外すだけで型チェックはしない。型エラーを確認するには `npx tsc -b`（または `npm run build`）を実行する。

テストはまだない。Vitest は Step 3 で導入する予定。

## アーキテクチャの方針

Vite 8 + React 19 + TypeScript で作り、描画は DOM（CSS Grid）で行う。回転はシンプル回転（壁蹴りなし）。詳しくは `docs/spec.md` を参照。

コードを置く場所は次の3つに分ける。この分け方を守る。

- `src/game/`: **React に依存しない純粋な TypeScript** のゲームロジック。フィールドは `Cell[][]`（0 = 空、1〜7 = ミノの種類）、状態更新は `(state, action) => newState` という形の reducer にする。Vitest のテスト対象。
- `src/hooks/`: ゲームループ（`requestAnimationFrame`）とキー入力。ロジックへの橋渡しだけをする。
- `src/components/`: 状態を表示するだけのコンポーネント。落下中のミノはフィールドのデータに書き込まず、描画のときに重ねる。

## TypeScript の設定で注意すること（`tsconfig.app.json`）

- TS 6 なので、`strict` は書いていなくてもデフォルトで有効になっている。
- `noUncheckedIndexedAccess`: `field[y][x]` の型は `Cell | undefined` になる。範囲外は `field[y]?.[x]` のように扱う。「範囲外は壁として扱う」という衝突判定のルールを、型で表すために有効にしている。
- `verbatimModuleSyntax`: 型だけを import するときは `import type` を使う必要がある。
- `erasableSyntaxOnly`: `enum` や `namespace` は使えない。ミノの種類などは union 型や `as const` で表す。
- `allowImportingTsExtensions`: `import App from './App.tsx'` のように拡張子を付けて import する書き方が使われている。
- `noUnusedLocals` / `noUnusedParameters` が有効なので、使っていない変数や引数があるとビルドが失敗する。

## Git ルール

- main にコミット禁止。PR を作る。
- コミットタイトルに Issue 番号をつける。（ex: \`デザインを適用(#8)\`）
- ステップ完了時にタグは付けない。
