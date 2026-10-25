import type { AuthSession, LoginInput, RegisterInput, User } from '../types/auth'
import { apiRequest } from './client'

export const authApi = {
  login: (input: LoginInput) => apiRequest<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  register: (input: RegisterInput) => apiRequest<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  me: (token: string) => apiRequest<{ user: User }>('/auth/me', {}, token),
}
