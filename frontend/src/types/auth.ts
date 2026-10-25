export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
}

export interface AuthSession { user: User; token: string }
export interface LoginInput { email: string; password: string }
export interface RegisterInput extends LoginInput { name: string }
