import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { server } from './test/server'

const api = 'http://localhost:4000/api'
const user = { id: 'user-1', email: 'user@autovault.in', name: 'Aarav Mehta', role: 'USER' }

function open(path: string) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

beforeEach(() => window.history.pushState({}, '', '/'))

describe('authentication routes', () => {
  it('redirects anonymous visitors from the dashboard to login', async () => {
    open('/dashboard')
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('validates login fields before sending a request', async () => {
    const requestSpy = vi.fn()
    server.use(http.post(`${api}/auth/login`, () => { requestSpy(); return HttpResponse.json({}) }))
    open('/login')
    await userEvent.type(screen.getByLabelText(/email address/i), 'invalid-email')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(requestSpy).not.toHaveBeenCalled()
  })

  it('toggles password visibility', async () => {
    open('/login')
    const password = screen.getByLabelText(/^password$/i)
    expect(password).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('logs in, stores the session, and opens the dashboard', async () => {
    server.use(http.post(`${api}/auth/login`, async ({ request }) => {
      expect(await request.json()).toEqual({ email: user.email, password: 'secret123' })
      return HttpResponse.json({ user, token: 'signed-token' })
    }))
    open('/login')
    await userEvent.type(screen.getByLabelText(/email address/i), user.email)
    await userEvent.type(screen.getByLabelText(/^password$/i), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByRole('heading', { name: /inventory dashboard/i })).toBeInTheDocument()
    expect(sessionStorage.getItem('autovault.session')).toContain('signed-token')
  })

  it('shows incorrect credential feedback without storing a session', async () => {
    server.use(http.post(`${api}/auth/login`, () =>
      HttpResponse.json({ error: 'Invalid email or password' }, { status: 401 })))
    open('/login')
    await userEvent.type(screen.getByLabelText(/email address/i), user.email)
    await userEvent.type(screen.getByLabelText(/^password$/i), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i)
    expect(sessionStorage.getItem('autovault.session')).toBeNull()
  })

  it('rejects mismatched registration passwords before sending a request', async () => {
    const requestSpy = vi.fn()
    server.use(http.post(`${api}/auth/register`, () => { requestSpy(); return HttpResponse.json({}) }))
    open('/register')
    await userEvent.type(screen.getByLabelText(/full name/i), user.name)
    await userEvent.type(screen.getByLabelText(/email address/i), user.email)
    await userEvent.type(screen.getByLabelText(/^password$/i), 'secret123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
    expect(requestSpy).not.toHaveBeenCalled()
  })

  it('registers a standard user without sending a role', async () => {
    server.use(http.post(`${api}/auth/register`, async ({ request }) => {
      expect(await request.json()).toEqual({ name: user.name, email: user.email, password: 'secret123' })
      return HttpResponse.json({ user, token: 'registered-token' }, { status: 201 })
    }))
    open('/register')
    await userEvent.type(screen.getByLabelText(/full name/i), user.name)
    await userEvent.type(screen.getByLabelText(/email address/i), user.email)
    await userEvent.type(screen.getByLabelText(/^password$/i), 'secret123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByRole('heading', { name: /inventory dashboard/i })).toBeInTheDocument()
  })

  it('shows duplicate email feedback', async () => {
    server.use(http.post(`${api}/auth/register`, () =>
      HttpResponse.json({ error: 'User with this email already exists' }, { status: 409 })))
    open('/register')
    await userEvent.type(screen.getByLabelText(/full name/i), user.name)
    await userEvent.type(screen.getByLabelText(/email address/i), user.email)
    await userEvent.type(screen.getByLabelText(/^password$/i), 'secret123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/already exists/i)
  })

  it('validates a stored session with the backend before showing protected content', async () => {
    sessionStorage.setItem('autovault.session', JSON.stringify({ user, token: 'existing-token' }))
    server.use(http.get(`${api}/auth/me`, ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer existing-token')
      return HttpResponse.json({ user })
    }))
    open('/dashboard')
    expect(screen.getByRole('status')).toHaveTextContent(/verifying your session/i)
    expect(await screen.findByRole('heading', { name: /inventory dashboard/i })).toBeInTheDocument()
  })

  it('logs out and clears the protected session', async () => {
    sessionStorage.setItem('autovault.session', JSON.stringify({ user, token: 'existing-token' }))
    server.use(http.get(`${api}/auth/me`, () => HttpResponse.json({ user })))
    open('/dashboard')
    await userEvent.click(await screen.findByRole('button', { name: /sign out/i }))
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    await waitFor(() => expect(sessionStorage.getItem('autovault.session')).toBeNull())
  })
})
