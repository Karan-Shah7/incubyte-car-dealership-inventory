import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PasswordField } from '../components/auth/PasswordField'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const { login, status } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [requestError, setRequestError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = {
      email: emailPattern.test(email) ? undefined : 'Enter a valid email address',
      password: password ? undefined : 'Password is required',
    }
    setErrors(nextErrors)
    setRequestError('')
    if (nextErrors.email || nextErrors.password) return
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <AuthLayout>
      <p className="eyebrow">Dealership access</p>
      <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight">Welcome Back</h1>
      <p className="mt-3 text-slate-600">Sign in to manage inventory and dealership operations.</p>
      {requestError && <div className="form-alert" role="alert">{requestError}</div>}
      <form className="mt-8 space-y-5" noValidate onSubmit={submit}>
        <div>
          <label className="form-label" htmlFor="login-email">Email address</label>
          <input id="login-email" className="form-input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} />
          {errors.email && <p id="login-email-error" className="field-error">{errors.email}</p>}
        </div>
        <PasswordField id="login-password" label="Password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} />
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign In'}</button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-600">New to AutoVault? <Link className="text-link" to="/register">Create an account</Link></p>
    </AuthLayout>
  )
}
