export function App() {
  return (
    <main className="min-h-screen bg-slate-canvas text-midnight">
      <section className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
        <div className="relative hidden overflow-hidden bg-midnight px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <CarIcon />
            </span>
            <div>
              <p className="font-heading text-xl font-bold tracking-tight">AutoVault India</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Enterprise inventory platform
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
              <span className="size-2 rounded-full bg-success" />
              Secure dealership workspace
            </p>
            <p className="font-heading text-5xl font-extrabold leading-[1.08] tracking-tight xl:text-6xl">
              Your dealership.
              <br />
              Your inventory.
              <br />
              <span className="text-royal-blue">In control.</span>
            </p>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300">
              A focused inventory workspace for dealership teams across India.
            </p>
          </div>

          <p className="border-t border-slate-800 pt-6 text-sm text-slate-400">
            AutoVault India · Mumbai Central
          </p>
        </div>

        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12 sm:px-10">
          <div className="w-full max-w-lg">
            <div className="brand-lockup mb-14 lg:hidden">
              <span className="brand-mark" aria-hidden="true">
                <CarIcon />
              </span>
              <p className="font-heading text-xl font-bold">AutoVault India</p>
            </div>

            <p className="eyebrow">Dealership access</p>
            <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              AutoVault India
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Your inventory workspace is starting securely.
            </p>

            <div className="mt-10 rounded-lg border border-border-gray bg-slate-50 p-6" role="status" aria-live="polite">
              <div className="flex items-center gap-4">
                <span className="loading-ring" aria-hidden="true" />
                <div>
                  <p className="font-heading font-semibold text-midnight">Preparing your dealership workspace</p>
                  <p className="mt-1 text-sm text-slate-500">Loading secure application routes…</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 16.5h14M6.5 16.5l-1-4.5 2-4h9l2 4-1 4.5M8 12h8" />
      <circle cx="8" cy="16.5" r="1.5" />
      <circle cx="16" cy="16.5" r="1.5" />
    </svg>
  )
}
