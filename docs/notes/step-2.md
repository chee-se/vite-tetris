# Step 2:

## 分かったこと
- `typeof` で値を型の文脈で扱う
  - 値: `const TYPES = ['left', 'right', 'down']` as const
  - readonlyタプル型:  type Type = `typeof TYPES // typeof は変数名にしか効かない`
  - 数値でリテラル型を取り出して和型: `typeof ['left', 'right', 'down'][number]`
  - mapped type型を経由して、オブジェクト型の和型に変形: `{[T in ObjType]: {key: T}}[ObjType]`
- useEffect: 副作用。React の外とのやりとり
- useReducer: useState reducer は透過な関数。setter ではない関数で state を変更する
- oxfmt 導入

## ハマったこと

- 型の変形。as を潰すために、Object.entries を避けた抽出が必要になった
- reducer の中で state を直接変更してうまく動かなくなった

## まだ分からないこと

- 
