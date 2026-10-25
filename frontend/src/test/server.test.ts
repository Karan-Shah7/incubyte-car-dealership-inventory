import { expect, it } from 'vitest'

it('intercepts API requests through the shared mock server', async () => {
  const response = await fetch('http://localhost:4000/api/health')

  expect(response.ok).toBe(true)
  await expect(response.json()).resolves.toEqual({ status: 'ok' })
})
