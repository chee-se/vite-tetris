import { expect, test } from '@playwright/test'

test('Enter でタイトルからゲームを始められる', async ({ page }) => {
  await page.goto('/')

  // タイトル画面のオーバーレイが出ている
  await expect(page.getByText('Enter でスタート')).toBeVisible()

  await page.keyboard.press('Enter')

  // プレイ中はオーバーレイが消える
  await expect(page.getByText('Enter でスタート')).toBeHidden()
})
