import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { SessionStatus } from './SessionStatus'

export function ProtectedRoute() {
  const { status } = useAuth()
  if (status === 'checking') return <SessionStatus />
  if (status === 'anonymous') return <Navigate to="/login" replace />
  return <Outlet />
}
