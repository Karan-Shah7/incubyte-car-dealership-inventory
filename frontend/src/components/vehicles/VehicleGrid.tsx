import type { Vehicle } from '../../types/vehicle'
import { formatInr } from '../../utils/currency'

export function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  if (!vehicles.length) {
    return <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-2xl" aria-hidden="true">⌕</div><h2 className="mt-4 font-heading text-xl font-bold">No vehicles found</h2><p className="mt-2 text-slate-500">Adjust your filters or ask an administrator to add inventory.</p></section>
  }
  return (
    <section aria-labelledby="available-vehicles-title">
      <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Live inventory</p><h2 id="available-vehicles-title" className="mt-2 font-heading text-2xl font-bold">Available vehicles</h2></div><p className="text-sm text-slate-500">{vehicles.length} {vehicles.length === 1 ? 'model' : 'models'}</p></div>
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {vehicles.map((vehicle) => <VehicleCard vehicle={vehicle} key={vehicle.id} />)}
      </div>
    </section>
  )
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const available = vehicle.quantity > 0
  return (
    <article className="overflow-hidden rounded-xl border border-border-gray bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="vehicle-visual" aria-hidden="true"><span>{vehicle.make.slice(0, 1)}{vehicle.model.slice(0, 1)}</span></div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-royal-blue">{vehicle.category}</p><h3 className="mt-1 font-heading text-xl font-bold">{vehicle.make} {vehicle.model}</h3></div><span className={available ? 'stock-badge stock-badge--available' : 'stock-badge stock-badge--empty'}>{available ? `${vehicle.quantity} in stock` : 'Sold out'}</span></div>
        <p className="mt-5 font-heading text-2xl font-extrabold">{formatInr(vehicle.price)}</p>
      </div>
    </article>
  )
}
