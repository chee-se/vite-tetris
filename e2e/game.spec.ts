import { expect, test, type Page } from '@playwright/test'

test('Enter でタイトルからゲームを始められる', async ({ page }) => {
  await page.goto('/')

  // タイトル画面のオーバーレイが出ている
  await expect(page.getByText('Enter でスタート')).toBeVisible()

  await page.keyboard.press('Enter')

  // プレイ中はオーバーレイが消える
  await expect(page.getByText('Enter でスタート')).toBeHidden()
})

async function startGame(url: string, page: Page) {
  await page.goto(url)
  await expect(page.getByText('Enter でスタート')).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Enter でスタート')).toBeHidden()
}

async function nextCells(page: Page): Promise<(string | null)[]> {
  const next = page.locator('section', {
    has: page.getByRole('heading', { name: 'NEXT' }),
  })
  return next
    .locator('[data-cell]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-cell')))
}

test('固定 seed のとき、ミノが固定される', async ({ page }) => {
  await startGame('/?seed=42', page)
  // 5回ハードドロップ
  const cell1 = []
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space')
    cell1.push(await nextCells(page))
  }

  await startGame('/?seed=42', page)
  // 5回ハードドロップ
  const cell2 = []
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space')
    cell2.push(await nextCells(page))
  }
  expect(cell1).toEqual(cell2)
})

test('seed が変わると、違うミノが出現する', async ({ page }) => {
  await startGame('/?seed=1', page)
  // 5回ハードドロップ
  const cell1 = []
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space')
    cell1.push(await nextCells(page))
  }

  await startGame('/?seed=2', page)
  // 5回ハードドロップ
  const cell2 = []
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space')
    cell2.push(await nextCells(page))
  }
  expect(cell1).not.toEqual(cell2)
})
