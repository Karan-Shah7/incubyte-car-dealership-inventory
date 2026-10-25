import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/context'

export function AdminRoute() {
  const { session } = useAuth()
  return session?.user.role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />
}
