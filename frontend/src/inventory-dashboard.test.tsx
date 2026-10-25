import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { server } from './test/server'

const api = 'http://localhost:4000/api'
const user = { id: 'user-1', email: 'user@autovault.in', name: 'Aarav Mehta', role: 'USER' }
const vehicles = [
  { id: 'vehicle-1', make: 'Tata', model: 'Nexon', category: 'SUV', price: 845000, quantity: 3, createdAt: '2026-10-20T10:00:00.000Z', updatedAt: '2026-10-20T10:00:00.000Z' },
  { id: 'vehicle-2', make: 'Mahindra', model: 'XUV700', category: 'SUV', price: 2150000, quantity: 0, createdAt: '2026-10-21T10:00:00.000Z', updatedAt: '2026-10-21T10:00:00.000Z' },
  { id: 'vehicle-3', make: 'Honda', model: 'City', category: 'Sedan', price: 1420000, quantity: 2, createdAt: '2026-10-22T10:00:00.000Z', updatedAt: '2026-10-22T10:00:00.000Z' },
]

function openDashboard() {
  sessionStorage.setItem('autovault.session', JSON.stringify({ user, token: 'signed-token' }))
  server.use(http.get(`${api}/auth/me`, () => HttpResponse.json({ user })))
  window.history.pushState({}, '', '/dashboard')
  return render(<App />)
}

beforeEach(() => window.history.pushState({}, '', '/'))

describe('inventory dashboard', () => {
  it('shows a loading state and then renders live vehicles with INR prices and derived totals', async () => {
    server.use(http.get(`${api}/vehicles`, async ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer signed-token')
      await delay(80)
      return HttpResponse.json({ vehicles })
    }))
    openDashboard()
    expect(await screen.findByRole('status', { name: /loading inventory/i })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /tata nexon/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /mahindra xuv700/i })).toBeInTheDocument()
    expect(screen.getByText('₹8,45,000')).toBeInTheDocument()
    expect(screen.getByText('5', { selector: '[data-metric="stock"]' })).toBeInTheDocument()
  })

  it('shows a useful empty state when no vehicles exist', async () => {
    server.use(http.get(`${api}/vehicles`, () => HttpResponse.json({ vehicles: [] })))
    openDashboard()
    expect(await screen.findByRole('heading', { name: /no vehicles found/i })).toBeInTheDocument()
    expect(screen.getByText(/adjust your filters or ask an administrator/i)).toBeInTheDocument()
  })

  it('searches by make and model using the backend query contract', async () => {
    const searchSpy = vi.fn()
    server.use(
      http.get(`${api}/vehicles`, () => HttpResponse.json({ vehicles })),
      http.get(`${api}/vehicles/search`, ({ request }) => {
        const url = new URL(request.url)
        searchSpy(Object.fromEntries(url.searchParams))
        return HttpResponse.json({ vehicles: [vehicles[0]] })
      }),
    )
    openDashboard()
    await screen.findByRole('heading', { name: /tata nexon/i })
    await userEvent.type(screen.getByLabelText(/^make$/i), 'Tata')
    await userEvent.type(screen.getByLabelText(/^model$/i), 'Nexon')
    await userEvent.click(screen.getByRole('button', { name: /search inventory/i }))
    await waitFor(() => expect(searchSpy).toHaveBeenCalledWith({ make: 'Tata', model: 'Nexon' }))
    expect(screen.queryByRole('heading', { name: /honda city/i })).not.toBeInTheDocument()
  })

  it('combines category and price filters without converting prices to display strings', async () => {
    const searchSpy = vi.fn()
    server.use(
      http.get(`${api}/vehicles`, () => HttpResponse.json({ vehicles })),
      http.get(`${api}/vehicles/search`, ({ request }) => {
        searchSpy(Object.fromEntries(new URL(request.url).searchParams))
        return HttpResponse.json({ vehicles: [vehicles[0]] })
      }),
    )
    openDashboard()
    await screen.findByRole('heading', { name: /tata nexon/i })
    await userEvent.selectOptions(screen.getByLabelText(/^category$/i), 'SUV')
    await userEvent.type(screen.getByLabelText(/minimum price/i), '500000')
    await userEvent.type(screen.getByLabelText(/maximum price/i), '1000000')
    await userEvent.click(screen.getByRole('button', { name: /search inventory/i }))
    await waitFor(() => expect(searchSpy).toHaveBeenCalledWith({ category: 'SUV', minPrice: '500000', maxPrice: '1000000' }))
  })

  it('rejects an invalid price range before calling search', async () => {
    const searchSpy = vi.fn()
    server.use(
      http.get(`${api}/vehicles`, () => HttpResponse.json({ vehicles })),
      http.get(`${api}/vehicles/search`, () => { searchSpy(); return HttpResponse.json({ vehicles: [] }) }),
    )
    openDashboard()
    await screen.findByRole('heading', { name: /tata nexon/i })
    await userEvent.type(screen.getByLabelText(/minimum price/i), '2000000')
    await userEvent.type(screen.getByLabelText(/maximum price/i), '1000000')
    await userEvent.click(screen.getByRole('button', { name: /search inventory/i }))
    expect(await screen.findByText(/minimum price cannot exceed maximum price/i)).toBeInTheDocument()
    expect(searchSpy).not.toHaveBeenCalled()
  })

  it('shows an API error and retries the inventory request', async () => {
    let attempts = 0
    server.use(http.get(`${api}/vehicles`, () => {
      attempts += 1
      return attempts === 1
        ? HttpResponse.json({ error: 'Inventory service unavailable' }, { status: 503 })
        : HttpResponse.json({ vehicles })
    }))
    openDashboard()
    expect(await screen.findByRole('alert')).toHaveTextContent(/inventory service unavailable/i)
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(await screen.findByRole('heading', { name: /tata nexon/i })).toBeInTheDocument()
  })

  it('fails safely and returns to login when the inventory token is rejected', async () => {
    server.use(http.get(`${api}/vehicles`, () => HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })))
    openDashboard()
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(sessionStorage.getItem('autovault.session')).toBeNull()
  })
})
