import type { Vehicle } from '../../types/vehicle'
import { formatInr } from '../../utils/currency'

export function InventoryMetrics({ vehicles }: { vehicles: Vehicle[] }) {
  const stock = vehicles.reduce((sum, vehicle) => sum + vehicle.quantity, 0)
  const value = vehicles.reduce((sum, vehicle) => sum + vehicle.price * vehicle.quantity, 0)
  const categories = new Set(vehicles.map((vehicle) => vehicle.category)).size
  const metrics = [
    { label: 'Vehicles in stock', value: String(stock), dataMetric: 'stock' },
    { label: 'Inventory value', value: formatInr(value) },
    { label: 'Models listed', value: String(vehicles.length) },
    { label: 'Categories', value: String(categories) },
  ]
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Inventory summary">
      {metrics.map((metric) => (
        <article className="rounded-xl border border-border-gray bg-white p-5 shadow-sm" key={metric.label}>
          <p className="text-sm font-medium text-slate-500">{metric.label}</p>
          <p className="mt-2 font-heading text-2xl font-bold" data-metric={metric.dataMetric}>{metric.value}</p>
        </article>
      ))}
    </section>
  )
}
