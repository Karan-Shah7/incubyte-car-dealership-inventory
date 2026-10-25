import { useEffect, useState, type FormEvent } from 'react'
import { vehiclesApi } from '../api/vehicles'
import { useAuth } from '../auth/context'
import { DashboardShell } from '../components/layout/DashboardShell'
import type { Vehicle } from '../types/vehicle'
import { formatInr } from '../utils/currency'

type Mode = 'add' | 'edit' | 'delete' | 'restock' | null
const blank = { make: '', model: '', category: '', price: '', quantity: '' }

export function AdminVehiclesPage() {
  const { session, logout } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [mode, setMode] = useState<Mode>(null)
  const [selected, setSelected] = useState<Vehicle | null>(null)
  const [form, setForm] = useState(blank)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const token = session?.token

  useEffect(() => {
    if (!token) return
    let active = true
    vehiclesApi.list(token).then(({ vehicles: result }) => { if (active) setVehicles(result) }).catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load inventory') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])
  if (!session) return null
  if (loading) return <DashboardShell user={session.user} onLogout={logout}><div className="grid min-h-96 place-items-center" role="status">Loading inventory management…</div></DashboardShell>

  function openAdd() { setForm(blank); setSelected(null); setError(''); setMode('add') }
  function openEdit(vehicle: Vehicle) { setSelected(vehicle); setForm({ make: vehicle.make, model: vehicle.model, category: vehicle.category, price: String(vehicle.price), quantity: '' }); setError(''); setMode('edit') }
  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })) }
  function close() { if (!saving) { setMode(null); setSelected(null); setError(''); setAmount('') } }

  async function saveVehicle(event: FormEvent) {
    event.preventDefault()
    if (!form.make.trim() || !form.model.trim() || !form.category.trim() || !(Number(form.price) > 0) || (mode === 'add' && (!/^\d+$/.test(form.quantity) || Number(form.quantity) < 0))) { setError('Complete every field with valid values'); return }
    setSaving(true)
    try {
      if (mode === 'add') {
        const { vehicle } = await vehiclesApi.create({ make: form.make.trim(), model: form.model.trim(), category: form.category.trim(), price: Number(form.price), quantity: Number(form.quantity) }, token!)
        setVehicles((current) => [vehicle, ...current])
      } else if (selected) {
        const { vehicle } = await vehiclesApi.update(selected.id, { make: form.make.trim(), model: form.model.trim(), category: form.category.trim(), price: Number(form.price) }, token!)
        setVehicles((current) => current.map((item) => item.id === vehicle.id ? vehicle : item))
      }
      setMode(null)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Operation failed') } finally { setSaving(false) }
  }

  async function confirmDelete() {
    if (!selected || !token) return
    setSaving(true)
    try { await vehiclesApi.delete(selected.id, token); setVehicles((current) => current.filter((item) => item.id !== selected.id)); setMode(null) }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Delete failed') } finally { setSaving(false) }
  }

  async function confirmRestock() {
    if (!selected || !token || !/^\d+$/.test(amount) || Number(amount) <= 0) { setError('Quantity to add must be a positive whole number'); return }
    setSaving(true)
    try { const { vehicle } = await vehiclesApi.restock(selected.id, Number(amount), token); setVehicles((current) => current.map((item) => item.id === vehicle.id ? vehicle : item)); setMode(null) }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Restock failed') } finally { setSaving(false) }
  }

  return <DashboardShell user={session.user} onLogout={logout}>
    <main className="px-5 py-7 sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Administrator</p><h1 className="mt-3 font-heading text-3xl font-bold">Inventory Management</h1><p className="mt-2 text-slate-500">Add vehicles, update details, and manage stock safely.</p></div><button className="primary-button !w-auto" onClick={openAdd}>Add Vehicle</button></header>
      {error && !mode && <div role="alert" className="form-alert">{error}</div>}
      <div className="mt-7 overflow-x-auto rounded-xl border border-border-gray bg-white"><table className="w-full min-w-[48rem] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{['Vehicle','Category','Price','Stock','Actions'].map((label) => <th className="px-5 py-4" key={label}>{label}</th>)}</tr></thead><tbody>{vehicles.map((vehicle) => <tr className="border-t border-border-gray" key={vehicle.id}><td className="px-5 py-4 font-semibold">{vehicle.make} {vehicle.model}</td><td className="px-5 py-4">{vehicle.category}</td><td className="px-5 py-4 font-heading font-bold">{formatInr(vehicle.price)}</td><td className="px-5 py-4">{vehicle.quantity}</td><td className="px-5 py-4"><div className="flex gap-2"><Action name={`Edit ${vehicle.make} ${vehicle.model}`} onClick={() => openEdit(vehicle)} /><Action name={`Restock ${vehicle.make} ${vehicle.model}`} onClick={() => { setSelected(vehicle); setAmount(''); setError(''); setMode('restock') }} /><Action name={`Delete ${vehicle.make} ${vehicle.model}`} onClick={() => { setSelected(vehicle); setError(''); setMode('delete') }} /></div></td></tr>)}</tbody></table></div>
    </div></main>
    {(mode === 'add' || mode === 'edit') && <Modal title={mode === 'add' ? 'Add Vehicle' : `Edit ${selected?.make} ${selected?.model}`} onClose={close}><form onSubmit={saveVehicle} className="space-y-4">{(['make','model','category','price'] as const).map((field) => <Field key={field} label={field.charAt(0).toUpperCase()+field.slice(1)} value={form[field]} onChange={(value) => update(field, value)} />)}{mode === 'add' && <Field label="Quantity" value={form.quantity} onChange={(value) => update('quantity', value)} />}{error && <div role="alert" className="form-alert">{error}</div>}<button className="primary-button" disabled={saving}>{mode === 'add' ? 'Save Vehicle' : 'Save Changes'}</button></form></Modal>}
    {mode === 'delete' && selected && <Modal title="Delete vehicle" onClose={close}><p>Delete {selected.make} {selected.model}? This cannot be undone.</p>{error && <div role="alert" className="form-alert">{error}</div>}<button className="primary-button mt-6 !bg-red-600" disabled={saving} onClick={() => void confirmDelete()}>Confirm Delete</button></Modal>}
    {mode === 'restock' && selected && <Modal title={`Restock ${selected.make} ${selected.model}`} onClose={close}><p className="mb-4 text-sm text-slate-500">Current quantity: {selected.quantity}</p><Field label="Quantity to add" value={amount} onChange={setAmount} />{error && <div role="alert" className="form-alert">{error}</div>}<button className="primary-button mt-6" disabled={saving} onClick={() => void confirmRestock()}>Confirm Restock</button></Modal>}
  </DashboardShell>
}

function Action({ name, onClick }: { name: string; onClick(): void }) { return <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50" aria-label={name} onClick={onClick}>{name.split(' ')[0]}</button> }
function Field({ label, value, onChange }: { label: string; value: string; onChange(value: string): void }) { const id = `admin-${label.toLowerCase().replaceAll(' ','-')}`; return <div><label className="form-label" htmlFor={id}>{label}</label><input id={id} className="form-input" value={value} onChange={(event) => onChange(event.target.value)} /></div> }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose(): void }) { return <div className="dialog-backdrop"><div className="dialog-card" role="dialog" aria-modal="true" aria-label={title}><div className="mb-5 flex items-center justify-between"><h2 className="font-heading text-2xl font-bold">{title}</h2><button className="secondary-button" onClick={onClose} aria-label="Close dialog">×</button></div>{children}</div></div> }
