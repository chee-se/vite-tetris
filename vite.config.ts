/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // tsconfig の paths（@/* → src/*）を Vite でも使う
    tsconfigPaths: true,
  },
  test: {
    // テストの種類ごとに動かす場所を分ける。
    // extends: true で、上の plugins や resolve をそれぞれのプロジェクトに引き継ぐ
    projects: [
      {
        extends: true,
        test: {
          // ロジックのテスト。DOM がいらないので Node で速く動かす
          name: 'unit',
          include: ['src/game/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          // コンポーネントのテスト。本物の Chromium の中で描画して確かめる
          name: 'browser',
          include: ['src/components/**/*.test.tsx'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
