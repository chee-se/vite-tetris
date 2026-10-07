import { defineConfig, devices } from '@playwright/test'

const PORT = 5173

// E2E テストの設定。テストのコードは Node で動き、ブラウザの外からアプリを操作する
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // 失敗したテストをもう一度動かしたときだけ trace を残す（npx playwright show-trace で見る）
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // テストの前に dev server を起動し、URL が応答するまで待つ。終わったら止める
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // 手元で npm run dev をすでに動かしていれば、それを使う
    reuseExistingServer: !process.env.CI,
  },
})
