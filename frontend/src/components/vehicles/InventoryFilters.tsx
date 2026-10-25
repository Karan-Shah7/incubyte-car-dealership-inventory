import type { FormEvent } from 'react'
import type { VehicleFilters } from '../../types/vehicle'

interface InventoryFiltersProps {
  categories: string[]
  filters: VehicleFilters
  error: string
  searching: boolean
  onChange(field: keyof VehicleFilters, value: string): void
  onReset(): void
  onSubmit(event: FormEvent): void
}

export function InventoryFilters({ categories, filters, error, searching, onChange, onReset, onSubmit }: InventoryFiltersProps) {
  return (
    <section className="rounded-xl border border-border-gray bg-white p-5 shadow-sm" aria-labelledby="inventory-filters-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 id="inventory-filters-title" className="font-heading text-lg font-bold">Find the right vehicle</h2><p className="mt-1 text-sm text-slate-500">Search live inventory using any combination of filters.</p></div>
        <button className="text-link text-sm" type="button" onClick={onReset}>Reset filters</button>
      </div>
      <form className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6" noValidate onSubmit={onSubmit}>
        <FilterInput label="Make" value={filters.make} onChange={(value) => onChange('make', value)} />
        <FilterInput label="Model" value={filters.model} onChange={(value) => onChange('model', value)} />
        <div>
          <label className="form-label" htmlFor="category">Category</label>
          <select className="form-input" id="category" value={filters.category} onChange={(event) => onChange('category', event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => <option value={category} key={category}>{category}</option>)}
          </select>
        </div>
        <FilterInput label="Minimum price" value={filters.minPrice} inputMode="decimal" onChange={(value) => onChange('minPrice', value)} />
        <FilterInput label="Maximum price" value={filters.maxPrice} inputMode="decimal" onChange={(value) => onChange('maxPrice', value)} />
        <div className="flex items-end"><button className="primary-button" type="submit" disabled={searching}>{searching ? 'Searching…' : 'Search Inventory'}</button></div>
      </form>
      {error && <p className="field-error mt-3">{error}</p>}
    </section>
  )
}

function FilterInput({ label, value, inputMode, onChange }: { label: string; value: string; inputMode?: 'decimal'; onChange(value: string): void }) {
  const id = label.toLowerCase().replaceAll(' ', '-')
  return <div><label className="form-label" htmlFor={id}>{label}</label><input className="form-input" id={id} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} /></div>
}
