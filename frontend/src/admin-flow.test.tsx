import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { server } from './test/server'

const api = 'http://localhost:4000/api'
const admin = { id: 'admin-1', email: 'admin@autovault.in', name: 'Priya Sharma', role: 'ADMIN' }
const regularUser = { ...admin, id: 'user-1', email: 'user@autovault.in', role: 'USER' }
const vehicle = { id: 'vehicle-1', make: 'Tata', model: 'Nexon', category: 'SUV', price: 845000, quantity: 3, createdAt: '2026-10-20T10:00:00.000Z', updatedAt: '2026-10-20T10:00:00.000Z' }

function open(path = '/admin/vehicles', user = admin) {
  sessionStorage.setItem('autovault.session', JSON.stringify({ user, token: 'admin-token' }))
  server.use(http.get(`${api}/auth/me`, () => HttpResponse.json({ user })), http.get(`${api}/vehicles`, () => HttpResponse.json({ vehicles: [vehicle] })))
  window.history.pushState({}, '', path)
  return render(<App />)
}

beforeEach(() => window.history.pushState({}, '', '/'))

describe('admin inventory management', () => {
  it('keeps ordinary users out of admin management', async () => {
    open('/admin/vehicles', regularUser)
    expect(await screen.findByRole('heading', { name: /inventory dashboard/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /inventory management/i })).not.toBeInTheDocument()
  })

  it('shows the management route and controls to administrators', async () => {
    open()
    expect(await screen.findByRole('heading', { name: /inventory management/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit tata nexon/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete tata nexon/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /restock tata nexon/i })).toBeInTheDocument()
  })

  it('adds a vehicle with numeric price and quantity', async () => {
    const createSpy = vi.fn()
    server.use(http.post(`${api}/vehicles`, async ({ request }) => {
      createSpy(await request.json())
      return HttpResponse.json({ vehicle: { ...vehicle, id: 'vehicle-2', make: 'Honda', model: 'City' } }, { status: 201 })
    }))
    open()
    await userEvent.click(await screen.findByRole('button', { name: /add vehicle/i }))
    await userEvent.type(screen.getByLabelText(/^make$/i), 'Honda')
    await userEvent.type(screen.getByLabelText(/^model$/i), 'City')
    await userEvent.type(screen.getByLabelText(/^category$/i), 'Sedan')
    await userEvent.type(screen.getByLabelText(/^price$/i), '1420000')
    await userEvent.type(screen.getByLabelText(/^quantity$/i), '2')
    await userEvent.click(screen.getByRole('button', { name: /save vehicle/i }))
    await waitFor(() => expect(createSpy).toHaveBeenCalledWith({ make: 'Honda', model: 'City', category: 'Sedan', price: 1420000, quantity: 2 }))
  })

  it('edits vehicle details without sending quantity', async () => {
    const updateSpy = vi.fn()
    server.use(http.put(`${api}/vehicles/${vehicle.id}`, async ({ request }) => {
      updateSpy(await request.json())
      return HttpResponse.json({ vehicle: { ...vehicle, price: 900000 } })
    }))
    open()
    await userEvent.click(await screen.findByRole('button', { name: /edit tata nexon/i }))
    const price = screen.getByLabelText(/^price$/i)
    await userEvent.clear(price)
    await userEvent.type(price, '900000')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(updateSpy).toHaveBeenCalledWith({ make: 'Tata', model: 'Nexon', category: 'SUV', price: 900000 }))
  })

  it('requires deletion confirmation before calling the API', async () => {
    const deleteSpy = vi.fn()
    server.use(http.delete(`${api}/vehicles/${vehicle.id}`, () => { deleteSpy(); return HttpResponse.json({ message: 'Vehicle deleted successfully' }) }))
    open()
    await userEvent.click(await screen.findByRole('button', { name: /delete tata nexon/i }))
    expect(deleteSpy).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }))
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledOnce())
  })

  it('validates restock as a positive integer and submits the amount', async () => {
    const restockSpy = vi.fn()
    server.use(http.post(`${api}/vehicles/${vehicle.id}/restock`, async ({ request }) => {
      restockSpy(await request.json())
      return HttpResponse.json({ message: 'Vehicle restocked successfully', vehicle: { ...vehicle, quantity: 5 } })
    }))
    open()
    await userEvent.click(await screen.findByRole('button', { name: /restock tata nexon/i }))
    await userEvent.type(screen.getByLabelText(/quantity to add/i), '0')
    await userEvent.click(screen.getByRole('button', { name: /confirm restock/i }))
    expect(await screen.findByText(/positive whole number/i)).toBeInTheDocument()
    expect(restockSpy).not.toHaveBeenCalled()
    await userEvent.clear(screen.getByLabelText(/quantity to add/i))
    await userEvent.type(screen.getByLabelText(/quantity to add/i), '2')
    await userEvent.click(screen.getByRole('button', { name: /confirm restock/i }))
    await waitFor(() => expect(restockSpy).toHaveBeenCalledWith({ amount: 2 }))
  })
})
