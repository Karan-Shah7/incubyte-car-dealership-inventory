import type { ReactNode } from 'react'
import type { User } from '../../types/auth'

interface DashboardShellProps {
  children: ReactNode
  user: User
  onLogout(): void
}

export function DashboardShell({ children, user, onLogout }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-canvas text-midnight lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen bg-midnight px-5 py-7 text-white lg:flex lg:flex-col">
        <div className="brand-lockup border-b border-slate-800 pb-7">
          <span className="brand-mark" aria-hidden="true"><CarIcon /></span>
          <div><p className="font-heading font-bold">AutoVault</p><p className="text-xs text-slate-400">INDIA</p></div>
        </div>
        <nav className="mt-7" aria-label="Primary navigation">
          <a className="flex items-center gap-3 rounded-lg bg-royal-blue px-4 py-3 text-sm font-semibold text-white" href="/dashboard" aria-current="page">
            <GridIcon /> Dashboard
          </a>
        </nav>
        <div className="mt-auto border-t border-slate-800 pt-6">
          <p className="truncate text-sm font-semibold">{user.name || 'Dealership user'}</p>
          <p className="mt-1 truncate text-xs text-slate-400">{user.email}</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-border-gray bg-white px-5 py-4 lg:justify-end">
          <div className="brand-lockup lg:hidden"><span className="brand-mark !size-10" aria-hidden="true"><CarIcon /></span><p className="font-heading font-bold">AutoVault India</p></div>
          <button className="secondary-button" type="button" onClick={onLogout}>Sign Out</button>
        </header>
        {children}
      </div>
    </div>
  )
}

function CarIcon() {
  return <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 16.5h14M6.5 16.5l-1-4.5 2-4h9l2 4-1 4.5M8 12h8" /><circle cx="8" cy="16.5" r="1.5" /><circle cx="16" cy="16.5" r="1.5" /></svg>
}

function GridIcon() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
}
