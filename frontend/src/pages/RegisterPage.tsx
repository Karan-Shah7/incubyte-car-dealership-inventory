import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PasswordField } from '../components/auth/PasswordField'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const { register, status } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [requestError, setRequestError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />
  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })) }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = {
      name: form.name.trim() ? undefined : 'Full name is required',
      email: emailPattern.test(form.email) ? undefined : 'Enter a valid email address',
      password: form.password.length >= 6 ? undefined : 'Password must be at least 6 characters',
      confirmPassword: form.password === form.confirmPassword ? undefined : 'Passwords do not match',
    }
    setErrors(nextErrors)
    setRequestError('')
    if (Object.values(nextErrors).some(Boolean)) return
    setSubmitting(true)
    try {
      await register({ name: form.name.trim(), email: form.email, password: form.password })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to create your account. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <AuthLayout>
      <p className="eyebrow">Join AutoVault</p>
      <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight">Create Account</h1>
      <p className="mt-3 text-slate-600">Set up secure access to your dealership workspace.</p>
      {requestError && <div className="form-alert" role="alert">{requestError}</div>}
      <form className="mt-7 space-y-4" noValidate onSubmit={submit}>
        <div>
          <label className="form-label" htmlFor="register-name">Full name</label>
          <input id="register-name" className="form-input" autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="register-email">Email address</label>
          <input id="register-email" className="form-input" type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <PasswordField id="register-password" label="Password" autoComplete="new-password" value={form.password} onChange={(event) => update('password', event.target.value)} error={errors.password} />
        <PasswordField id="register-confirm-password" label="Confirm password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} error={errors.confirmPassword} />
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create Account'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link className="text-link" to="/login">Sign in</Link></p>
    </AuthLayout>
  )
}
