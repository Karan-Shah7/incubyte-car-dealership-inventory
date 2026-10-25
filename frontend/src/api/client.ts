const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
export const apiBaseUrl = `${configuredUrl.replace(/\/$/, '')}/api`

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new ApiError(payload.error || 'Something went wrong. Please try again.', response.status)
  return payload as T
}
