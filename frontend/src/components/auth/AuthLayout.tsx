import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-canvas text-midnight">
      <section className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
        <div className="auth-hero">
          <Brand />
          <div className="max-w-xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
              <span className="size-2 rounded-full bg-success" /> Secure dealership workspace
            </p>
            <p className="font-heading text-5xl font-extrabold leading-[1.08] tracking-tight xl:text-6xl">
              Your dealership.<br />Your inventory.<br /><span className="text-royal-blue">In control.</span>
            </p>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300">A focused inventory workspace for dealership teams across India.</p>
          </div>
          <p className="border-t border-slate-800 pt-6 text-sm text-slate-400">AutoVault India · Mumbai Central</p>
        </div>
        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden"><Brand /></div>
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}

function Brand() {
  return (
    <div className="brand-lockup">
      <span className="brand-mark" aria-hidden="true"><CarIcon /></span>
      <div>
        <p className="font-heading text-xl font-bold tracking-tight">AutoVault India</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Enterprise inventory platform</p>
      </div>
    </div>
  )
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 16.5h14M6.5 16.5l-1-4.5 2-4h9l2 4-1 4.5M8 12h8" />
      <circle cx="8" cy="16.5" r="1.5" /><circle cx="16" cy="16.5" r="1.5" />
    </svg>
  )
}
