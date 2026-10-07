import { expect, test, type Locator, type Page } from '@playwright/test'

async function startGame(url: string, page: Page) {
  await page.goto(url)
  // タイトル画面のオーバーレイが出ている
  await expect(page.getByText('Enter でスタート')).toBeVisible()
  await page.keyboard.press('Enter')
  // プレイ中はオーバーレイが消える
  await expect(page.getByText('Enter でスタート')).toBeHidden()
}

// HOLD / NEXT の枠に表示されているセルの data-cell を、並び順のまま返す。
// 何も表示されていないときは空の配列になる
async function previewCells(
  page: Page,
  label: 'HOLD' | 'NEXT',
): Promise<(string | null)[]> {
  const preview = page.locator('section', {
    has: page.getByRole('heading', { name: label }),
  })
  return preview
    .locator('[data-cell]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-cell')))
}

function holdDisabledFrame(page: Page): Locator {
  return page
    .locator('section', {
      has: page.getByRole('heading', { name: 'HOLD' }),
    })
    .locator('[data-disabled]')
}

test('Enter でタイトルからゲームを始められる', async ({ page }) => {
  await startGame('/', page)
})

test('固定 seed のとき、ミノが固定される', async ({ page }) => {
  await startGame('/?seed=42', page)
  // 5回ハードドロップ
  const cell1 = []
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space')
    cell1.push(await previewCells(page, 'NEXT'))
  }

  await startGame('/?seed=42', page)
  // 5回ハードドロップ
  const cell2 = []
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space')
    cell2.push(await previewCells(page, 'NEXT'))
  }
  expect(cell1).toEqual(cell2)
})

test('seed が変わると、違うミノが出現する', async ({ page }) => {
  await startGame('/?seed=1', page)
  // 5回ハードドロップ
  const cell1 = []
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space')
    cell1.push(await previewCells(page, 'NEXT'))
  }

  await startGame('/?seed=2', page)
  // 5回ハードドロップ
  const cell2 = []
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space')
    cell2.push(await previewCells(page, 'NEXT'))
  }
  expect(cell1).not.toEqual(cell2)
})

// フィールドの全セルの data-cell を、上の行から順に返す。
// 落下中のミノとゴーストも含むので、ミノが動けば中身が変わる
async function boardCells(page: Page): Promise<(string | null)[]> {
  return page
    .getByTestId('board')
    .locator('[data-cell]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-cell')))
}

test('C でホールドすると、HOLD にミノが入る', async ({ page }) => {
  const disabledFrame = holdDisabledFrame(page)

  await startGame('/?seed=42', page)
  // スタート直後はHOLDが空
  const beforeHold = await previewCells(page, 'HOLD')
  expect(beforeHold).toEqual([])
  // ホールド
  await page.keyboard.press('c')
  await expect(disabledFrame).toHaveCount(1)
  const afterHold = await previewCells(page, 'HOLD')

  expect(beforeHold).not.toEqual(afterHold)
})

test('C でホールドすると、連続ホールド不能になり、ミノ落下後に戻る', async ({
  page,
}) => {
  const disabledFrame = holdDisabledFrame(page)

  await startGame('/?seed=42', page)
  // ホールド可能
  await expect(disabledFrame).toHaveCount(0)

  // ホールドするとホールド不可能に切り替わる
  // 1回目
  await page.keyboard.press('c')
  await expect(disabledFrame).toHaveCount(1)
  const held1 = await previewCells(page, 'HOLD')
  // 2回目（無効）
  await page.keyboard.press('c')
  await expect(disabledFrame).toHaveCount(1)
  await expect.poll(() => previewCells(page, 'HOLD')).toEqual(held1)
  // 3回目（ハードドロップ後。有効）
  await page.keyboard.press('Space')
  await expect(disabledFrame).toHaveCount(0)
  await page.keyboard.press('c')
  await expect.poll(() => previewCells(page, 'HOLD')).not.toEqual(held1)
})

test('C でホールドすると、落下中のミノをホールドする', async ({ page }) => {
  await startGame('/?seed=42', page)
  // next から次に落下するミノを取得し、ハードドロップで出現させる
  const currentCells = await previewCells(page, 'NEXT')
  await page.keyboard.press('Space')
  await expect.poll(() => previewCells(page, 'NEXT')).not.toEqual(currentCells)
  await page.keyboard.press('c')
  await expect.poll(() => previewCells(page, 'HOLD')).toEqual(currentCells)
})

test('一時停止している間は、時間がたってもミノが落ちない', async ({ page }) => {
  // 時計を偽物に差し替える。アプリが読み込まれる前（page.goto より前）に呼ぶ
  await page.clock.install()
  await startGame('/?seed=42', page)

  // ポーズ
  await page.keyboard.press('p')
  await expect(page.getByText('PAUSE', { exact: true })).toBeVisible()
  const currentCells = await boardCells(page)
  await page.clock.runFor(5000)
  await expect(await boardCells(page)).toEqual(currentCells)
  // ポーズ解除
  await page.keyboard.press('p')
  await expect(page.getByText('PAUSE', { exact: true })).toBeHidden()
  await page.clock.runFor(2000)
  await expect.poll(() => boardCells(page)).not.toEqual(currentCells)
})
