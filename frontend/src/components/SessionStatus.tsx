export function SessionStatus() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-canvas px-6">
      <div className="flex items-center gap-4 rounded-xl border border-border-gray bg-white p-6 shadow-sm" role="status">
        <span className="loading-ring" aria-hidden="true" />
        <div>
          <p className="font-heading font-semibold text-midnight">Verifying your session</p>
          <p className="mt-1 text-sm text-slate-500">Checking your secure dealership access…</p>
        </div>
      </div>
    </main>
  )
}
