# テトリス 実装計画

仕様は [spec.md](./spec.md) を参照。

技術方針：Vite + React + TypeScript、DOM 描画、SRS（Step 6 まではシンプル回転）。

## ディレクトリ構成

```
src/
├── game/          # React に依存しない純粋なゲームロジック（Vitest でテストする）
│   ├── types.ts
│   ├── tetrominoes.ts  # ミノの形
│   ├── bag.ts          # 7-bag
│   ├── random.ts       # seed つきの乱数
│   ├── field.ts
│   ├── piece.ts
│   ├── srs.ts          # 壁蹴りの表
│   ├── score.ts
│   └── reducer.ts
├── hooks/         # ゲームループ・キー入力などのカスタムフック
├── components/    # 表示用の React コンポーネント
├── App.tsx
└── main.tsx
```

## ステップ

MVP（遊べるテトリス）は **Step 5 まで**。

| Step | 作るもの | React / TS で学ぶこと | Vite で学ぶこと | 状態 |
|---|---|---|---|---|
| 0 | `create-vite`（react-ts）で雛形を作り、不要なファイルを消す | — | プロジェクト構成、入口になる `index.html`、dev server | 完了 |
| 1 | 固定データのフィールドを CSS Grid で表示する | コンポーネント、`Cell[][]` の型設計 | ES Modules、HMR、`vite.config.ts` のパスエイリアス（`@/`） | 完了 |
| 2 | ミノを 1 つ表示し、キーで左右・下に動かす | `useReducer`、キーボードイベント、union 型と `as const` | HMR で state が残る場合とリセットされる場合 | 完了 |
| 3 | 衝突判定・シンプル回転 | 純粋関数、`noUncheckedIndexedAccess` での配列アクセス | **Vitest の導入**（Vite の設定をそのまま使う）、TDD | 完了 |
| 4 | 自動落下・固定・次のミノの出現 | `requestAnimationFrame`、`useEffect` の後片付け、StrictMode で effect が 2 回動く問題、stale closure | 環境変数（`import.meta.env.DEV`、`.env`）でデバッグ表示を切り替える | 完了 |
| 5 | ライン消去・スコア・レベル・ゲームオーバー | 状態遷移の設計（判別可能な union 型） | — | 完了 |
| 6 | NEXT 表示・タイトル / 一時停止画面・見た目の調整 | コンポーネントの分割 | CSS Modules、静的アセット（`public/` と `import` の違い） | 完了 |
| 7 | 発展要素（7-bag、ゴースト、ホールド、SRS など） | 好きなものを選んで追加する | 自作プラグイン（任意） | 完了 |
| 8 | テストの拡充と Storybook（コンポーネントテスト・E2E・Storybook） | React Testing Library でのコンポーネントテスト、テストの層の分け方、テストのために乱数や時間を外から操作できる設計 | Vitest の `environment`（jsdom / Browser Mode）、Playwright の `webServer` で dev server を起動する、Storybook の `@storybook/react-vite`（Vite の設定を再利用する仕組み） | 完了 |
| 9 | ビルドと公開 | — | `vite build` の出力の中身（tree-shaking、コード分割）、`vite preview`、`base` の設定、GitHub Pages へのデプロイ | 未着手 |

## 各ステップの完了条件

どのステップでも、次の 2 つは共通の完了条件とする。

- 学習メモ（`docs/notes/step-N.md`）を書いた。
- `npm run build` と `npm run lint` が通る。

| Step | 固有の完了条件 |
|---|---|
| 0 | `npm run dev` で開発サーバーが起動し、ブラウザに最小限の画面が表示される。 |
| 1 | 10 × 20 のフィールドが表示され、ファイルを保存すると HMR で画面が更新される。 |
| 2 | ← → ↓ キーでミノが動く（衝突判定はまだなし）。 |
| 3 | ミノが壁やブロックを突き抜けない。回転できる。ロジックのテストが通る。 |
| 4 | ミノが自動で落ち、着地すると固定されて次のミノが出る。 |
| 5 | ラインが消え、スコアが増え、積み上がるとゲームオーバーになる。 |
| 6 | 次のミノが NEXT に表示される。タイトル → プレイ → 一時停止 → 再開 → ゲームオーバー → リスタートの流れが動く。 |
| 7 | ゴースト・7-bag・ホールド・SRS が動き、ロジックのテストが通る。`docs/spec.md` を新しい仕様に合わせた。 |
| 8 | コンポーネントテストと E2E テストが通る（E2E はゲーム開始・ホールド・一時停止など主要な流れ）。Storybook で主なコンポーネントを状態ごとに表示できる。追加した依存ごとに、何を解決するためかを学習メモに書いた。 |

## 進め方

### 役割分担

| 担当 | 中身 |
|---|---|
| 学習者が書く | `src/game/` のロジック（衝突判定・回転・ライン消去・reducer）、型定義、カスタムフックの中心部分 |
| Claude が書く | 雛形、CSS、設定ファイル、テストの土台、決まりきった処理 |
| 一緒に決める | 型の設計、状態の持ち方、フォルダの分け方 |

### Git の運用

- ステップごとにブランチ（`step-N/<内容>`）を切り、PR を作ってから `main` にマージする。

### 学習メモ

`docs/notes/step-N.md` に、次の 3 つを短く書く（[テンプレート](./notes/TEMPLATE.md)）。

- 分かったこと
- ハマったこと
- まだ分からないこと

### ライブラリの方針

状態管理ライブラリ（Zustand など）や Tailwind は最初は入れない。`useReducer` と素の CSS で作り、困ったところが出てきたら、何を解決したいのかを学習メモに書いてから入れる。
