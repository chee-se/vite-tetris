import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import PiecePreview from '@/components/PiecePreview.tsx'
import type { PieceType } from '@/game/types.ts'

describe('PiecePreview', () => {
  test('見出しを表示する', async () => {
    const screen = await render(<PiecePreview type="T" label="NEXT" />)

    await expect
      .element(screen.getByRole('heading', { name: 'NEXT' }))
      .toBeVisible()
  })

  test('表示するミノがないときはマスを描画しない', async () => {
    const screen = await render(<PiecePreview label="HOLD" />)

    expect(screen.container.querySelectorAll('[data-cell]').length).toBe(0)
  })

  const cases: { input: PieceType; expected: string[] }[] = [
    { input: 'O', expected: ['2', '2', '2', '2'] },
    { input: 'I', expected: ['1', '1', '1', '1'] },
    { input: 'T', expected: ['0', '3', '0', '3', '3', '3'] },
  ]
  test.each(cases)(
    '指定の種類のミノを表示する($input)',
    async ({ input, expected }) => {
      const screen = await render(<PiecePreview type={input} label="NEXT" />)

      const cells = [...screen.container.querySelectorAll('[data-cell]')].map(
        (el) => el.getAttribute('data-cell'),
      )
      expect(cells).toEqual(expected)
    },
  )

  test('使用できないとき、半透明に表示する', async () => {
    const screen = await render(
      <PiecePreview type="O" disabled={true} label="HOLD" />,
    )

    const frame = screen.container.querySelector('[data-disabled]')
    if (frame === null)
      throw Error('frame が [data-disabled] でないか存在しません。')
    expect(getComputedStyle(frame).opacity).toBe('0.4')
  })
})
