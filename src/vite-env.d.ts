// import.meta.env に自分で足した変数の型。値は .env から文字列として渡される
interface ImportMetaEnv {
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
