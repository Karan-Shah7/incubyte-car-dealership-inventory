import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/context'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { SessionStatus } from './components/SessionStatus'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminVehiclesPage } from './pages/AdminVehiclesPage'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<AdminRoute />}><Route path="/admin/vehicles" element={<AdminVehiclesPage />} /></Route>
          </Route>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function HomeRedirect() {
  const { status } = useAuth()
  if (status === 'checking') return <SessionStatus />
  return <Navigate to={status === 'authenticated' ? '/dashboard' : '/login'} replace />
}
