import { useEffect, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { AuthSession } from '../types/auth'
import { AuthContext, type AuthContextValue, type AuthStatus } from './context'

const storageKey = 'autovault.session'

function readStoredSession(): AuthSession | null {
  const stored = sessionStorage.getItem(storageKey)
  if (!stored) return null
  try {
    const session = JSON.parse(stored) as Partial<AuthSession>
    if (!session.token || !session.user?.id || !session.user.email || !session.user.role) throw new Error('Invalid session')
    return session as AuthSession
  } catch {
    sessionStorage.removeItem(storageKey)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialSession] = useState(readStoredSession)
  const [session, setSession] = useState<AuthSession | null>(initialSession)
  const [status, setStatus] = useState<AuthStatus>(initialSession ? 'checking' : 'anonymous')

  useEffect(() => {
    if (!initialSession) return
    let active = true
    authApi.me(initialSession.token).then(({ user }) => {
      if (!active) return
      const verified = { token: initialSession.token, user: { ...initialSession.user, ...user } }
      sessionStorage.setItem(storageKey, JSON.stringify(verified))
      setSession(verified)
      setStatus('authenticated')
    }).catch(() => {
      if (!active) return
      sessionStorage.removeItem(storageKey)
      setSession(null)
      setStatus('anonymous')
    })
    return () => { active = false }
  }, [initialSession])

  async function save(nextSession: Promise<AuthSession>) {
    const resolved = await nextSession
    sessionStorage.setItem(storageKey, JSON.stringify(resolved))
    setSession(resolved)
    setStatus('authenticated')
  }

  const value: AuthContextValue = {
    session,
    status,
    login: (input) => save(authApi.login(input)),
    register: (input) => save(authApi.register(input)),
    logout() {
      sessionStorage.removeItem(storageKey)
      setSession(null)
      setStatus('anonymous')
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
