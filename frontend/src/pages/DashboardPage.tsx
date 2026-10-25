import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { vehiclesApi } from '../api/vehicles'
import { useAuth } from '../auth/context'
import { DashboardShell } from '../components/layout/DashboardShell'
import { InventoryFilters } from '../components/vehicles/InventoryFilters'
import { InventoryMetrics } from '../components/vehicles/InventoryMetrics'
import { VehicleGrid } from '../components/vehicles/VehicleGrid'
import type { Vehicle, VehicleFilters } from '../types/vehicle'

const emptyFilters: VehicleFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' }
const pricePattern = /^\d+(\.\d+)?$/

export function DashboardPage() {
  const { logout, session } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filters, setFilters] = useState<VehicleFilters>(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [filterError, setFilterError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const token = session?.token

  useEffect(() => {
    if (!token) return
    let active = true
    vehiclesApi.list(token).then((response) => {
      if (!active) return
      setVehicles(response.vehicles)
      setCategories([...new Set(response.vehicles.map((vehicle) => vehicle.category))].sort())
    }).catch((requestError: unknown) => {
      if (!active) return
      if (requestError instanceof ApiError && requestError.status === 401) logout()
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load inventory. Please try again.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [logout, reloadKey, token])

  const user = session?.user
  const headingName = user?.name?.split(' ')[0] || 'there'
  if (!user) return null

  function updateFilter(field: keyof VehicleFilters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }))
    setFilterError('')
  }

  async function submitFilters(event: FormEvent) {
    event.preventDefault()
    const prices = [filters.minPrice, filters.maxPrice].filter(Boolean)
    if (prices.some((price) => !pricePattern.test(price))) {
      setFilterError('Prices must contain numbers only')
      return
    }
    if (filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice)) {
      setFilterError('Minimum price cannot exceed maximum price')
      return
    }
    setFilterError('')
    setSearching(true)
    setError('')
    try {
      if (!token) return
      const response = await vehiclesApi.search(filters, token)
      setVehicles(response.vehicles)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) logout()
      else setError(requestError instanceof Error ? requestError.message : 'Unable to search inventory. Please try again.')
    } finally { setSearching(false) }
  }

  function resetFilters() {
    setFilters(emptyFilters)
    setFilterError('')
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  function retry() {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  return (
    <DashboardShell user={user} onLogout={logout}>
      <main className="px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-[96rem]">
          <header className="mb-7"><p className="text-sm font-semibold text-royal-blue">DEALERSHIP OVERVIEW</p><h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">Inventory Dashboard</h1><p className="mt-2 text-slate-500">Welcome back, {headingName}. Here is your live inventory position.</p></header>
          {loading ? (
            <div className="grid min-h-80 place-items-center rounded-xl border border-border-gray bg-white" role="status" aria-label="Loading inventory"><div className="text-center"><span className="loading-ring mx-auto block" aria-hidden="true" /><p className="mt-4 font-semibold">Loading inventory…</p></div></div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center" role="alert"><h2 className="font-heading text-xl font-bold">Inventory could not be loaded</h2><p className="mt-2 text-red-700">{error}</p><button className="secondary-button mt-5" type="button" onClick={retry}>Try again</button></div>
          ) : (
            <div className="space-y-7">
              <InventoryMetrics vehicles={vehicles} />
              <InventoryFilters categories={categories} filters={filters} error={filterError} searching={searching} onChange={updateFilter} onReset={resetFilters} onSubmit={submitFilters} />
              <VehicleGrid vehicles={vehicles} />
            </div>
          )}
        </div>
      </main>
    </DashboardShell>
  )
}
