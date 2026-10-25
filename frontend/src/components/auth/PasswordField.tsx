import { useState, type InputHTMLAttributes } from 'react'

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
}

export function PasswordField({ label, error, id, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const errorId = error ? `${id}-error` : undefined
  return (
    <div>
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input {...inputProps} id={id} type={visible ? 'text' : 'password'} className="form-input pr-20" aria-invalid={Boolean(error)} aria-describedby={errorId} />
        <button className="password-toggle" type="button" onClick={() => setVisible((value) => !value)} aria-label={`${visible ? 'Hide' : 'Show'} password`}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  )
}
