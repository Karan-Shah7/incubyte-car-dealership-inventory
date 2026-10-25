import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('application shell', () => {
  it('renders the AutoVault India identity and initial loading status', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /autovault india/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/preparing your dealership workspace/i)
  })
})
