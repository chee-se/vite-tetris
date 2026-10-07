import type { StorybookConfig } from '@storybook/react-vite'

// Storybook の設定。この中身は Node で動く（ブラウザ側の設定は preview.ts）
const config: StorybookConfig = {
  // src の中の *.stories.tsx を story として読み込む
  stories: ['../src/**/*.stories.tsx'],
  // Vite でビルドする React 用のフレームワーク。
  // プロジェクトの vite.config.ts を読み込むので、@/ のエイリアスや CSS Modules がそのまま使える
  framework: '@storybook/react-vite',
}

export default config
