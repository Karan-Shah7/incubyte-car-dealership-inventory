import { useAuth } from '../auth/context'

export function DashboardPage() {
  const { logout, session } = useAuth()
  return (
    <main className="min-h-screen bg-slate-canvas p-6 text-midnight sm:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border-gray pb-6">
          <div>
            <p className="eyebrow">AutoVault India</p>
            <h1 className="mt-3 font-heading text-3xl font-bold">Inventory Dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Signed in as {session?.user.email}</p>
          </div>
          <button className="secondary-button" type="button" onClick={logout}>Sign Out</button>
        </header>
        <section className="mt-8 rounded-xl border border-border-gray bg-white p-8">
          <h2 className="font-heading text-xl font-semibold">Your secure workspace is ready</h2>
          <p className="mt-2 text-slate-600">Live inventory features will be added in the next verified phase.</p>
        </section>
      </div>
    </main>
  )
}
