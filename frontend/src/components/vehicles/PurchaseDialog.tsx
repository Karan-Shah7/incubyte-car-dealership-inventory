import { useEffect, useRef } from 'react'
import type { Vehicle } from '../../types/vehicle'
import { formatInr } from '../../utils/currency'

interface PurchaseDialogProps {
  vehicle: Vehicle
  error: string
  submitting: boolean
  onCancel(): void
  onConfirm(): void
}

export function PurchaseDialog({ vehicle, error, submitting, onCancel, onConfirm }: PurchaseDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { confirmRef.current?.focus() }, [])

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onCancel() }}>
      <div className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="purchase-dialog-title" onKeyDown={(event) => { if (event.key === 'Escape' && !submitting) onCancel() }}>
        <p className="eyebrow">Secure confirmation</p>
        <h2 id="purchase-dialog-title" className="mt-4 font-heading text-2xl font-bold">Confirm purchase</h2>
        <p className="mt-3 leading-7 text-slate-600">Purchase one <strong className="text-midnight">{vehicle.make} {vehicle.model}</strong> for {formatInr(vehicle.price)}? Inventory will be updated immediately.</p>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="secondary-button" type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
          <button ref={confirmRef} className="primary-button sm:w-auto" type="button" onClick={onConfirm} disabled={submitting}>{submitting ? 'Purchasing…' : 'Confirm Purchase'}</button>
        </div>
      </div>
    </div>
  )
}
