import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { server } from './test/server'

const api = 'http://localhost:4000/api'
const user = { id: 'user-1', email: 'user@autovault.in', name: 'Aarav Mehta', role: 'USER' }
const available = { id: 'vehicle-1', make: 'Tata', model: 'Nexon', category: 'SUV', price: 845000, quantity: 2, createdAt: '2026-10-20T10:00:00.000Z', updatedAt: '2026-10-20T10:00:00.000Z' }
const soldOut = { ...available, id: 'vehicle-2', make: 'Mahindra', model: 'XUV700', quantity: 0 }

function openDashboard() {
  sessionStorage.setItem('autovault.session', JSON.stringify({ user, token: 'signed-token' }))
  server.use(http.get(`${api}/auth/me`, () => HttpResponse.json({ user })))
  window.history.pushState({}, '', '/dashboard')
  return render(<App />)
}

beforeEach(() => window.history.pushState({}, '', '/'))

describe('vehicle purchasing', () => {
  it('disables purchasing when a vehicle is sold out', async () => {
    server.use(http.get(`${api}/vehicles`, () => HttpResponse.json({ vehicles: [available, soldOut] })))
    openDashboard()
    expect(await screen.findByRole('button', { name: /purchase mahindra xuv700/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /purchase tata nexon/i })).toBeEnabled()
  })

  it('requires confirmation, prevents repeats, and refreshes inventory after success', async () => {
    let listCalls = 0
    const purchaseSpy = vi.fn()
    server.use(
      http.get(`${api}/vehicles`, () => {
        listCalls += 1
        return HttpResponse.json({ vehicles: [{ ...available, quantity: listCalls === 1 ? 2 : 1 }] })
      }),
      http.post(`${api}/vehicles/${available.id}/purchase`, ({ request }) => {
        purchaseSpy(request.headers.get('authorization'))
        return HttpResponse.json({ message: 'Vehicle purchased successfully', vehicle: { ...available, quantity: 1 } })
      }),
    )
    openDashboard()
    await userEvent.click(await screen.findByRole('button', { name: /purchase tata nexon/i }))
    const dialog = screen.getByRole('dialog', { name: /confirm purchase/i })
    expect(dialog).toHaveTextContent(/tata nexon/i)
    await userEvent.click(screen.getByRole('button', { name: /confirm purchase/i }))
    expect(await screen.findByRole('status', { name: /purchase successful/i })).toHaveTextContent(/successfully/i)
    await waitFor(() => expect(listCalls).toBe(2))
    expect(purchaseSpy).toHaveBeenCalledOnce()
    expect(purchaseSpy).toHaveBeenCalledWith('Bearer signed-token')
    expect(screen.getByText(/1 in stock/i)).toBeInTheDocument()
  })

  it('handles a concurrent out-of-stock response and refreshes the stock status', async () => {
    let listCalls = 0
    server.use(
      http.get(`${api}/vehicles`, () => {
        listCalls += 1
        return HttpResponse.json({ vehicles: [{ ...available, quantity: listCalls === 1 ? 1 : 0 }] })
      }),
      http.post(`${api}/vehicles/${available.id}/purchase`, () => HttpResponse.json({ error: 'Vehicle is out of stock' }, { status: 409 })),
    )
    openDashboard()
    await userEvent.click(await screen.findByRole('button', { name: /purchase tata nexon/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm purchase/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/out of stock/i)
    await waitFor(() => expect(listCalls).toBe(2))
    expect(screen.getByRole('button', { name: /purchase tata nexon/i })).toBeDisabled()
  })

  it('closes the confirmation dialog with Escape', async () => {
    server.use(http.get(`${api}/vehicles`, () => HttpResponse.json({ vehicles: [available] })))
    openDashboard()
    await userEvent.click(await screen.findByRole('button', { name: /purchase tata nexon/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('logs out when the purchase token has expired', async () => {
    server.use(
      http.get(`${api}/vehicles`, () => HttpResponse.json({ vehicles: [available] })),
      http.post(`${api}/vehicles/${available.id}/purchase`, () => HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })),
    )
    openDashboard()
    await userEvent.click(await screen.findByRole('button', { name: /purchase tata nexon/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm purchase/i }))
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(sessionStorage.getItem('autovault.session')).toBeNull()
  })
})
