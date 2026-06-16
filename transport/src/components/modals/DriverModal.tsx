'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { saveDriverAction } from '@/actions/drivers'

type DriverRow = {
  id?: string
  full_name?: string | null
  phone?: string | null
  license_number?: string | null
  license_expiry?: string | null
  salary_base?: number | null
  address?: string | null
  emergency_contact?: string | null
  status?: 'available' | 'on_trip' | 'on_leave' | 'inactive' | null
  notes?: string | null
}

interface DriverModalProps {
  open: boolean
  onClose: () => void
  initialData?: DriverRow | null
}

export default function DriverModal({
  open,
  onClose,
  initialData,
}: DriverModalProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {initialData?.id ? 'Edit driver' : 'Add driver'}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Manage driver identity, salary, license, and current availability.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-[var(--color-surface-offset)]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form action={saveDriverAction} className="space-y-5 p-5">
          <input type="hidden" name="id" defaultValue={initialData?.id ?? ''} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Full name</label>
              <input
                name="full_name"
                defaultValue={initialData?.full_name ?? ''}
                className="input"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                name="phone"
                defaultValue={initialData?.phone ?? ''}
                className="input"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">License number</label>
              <input
                name="license_number"
                defaultValue={initialData?.license_number ?? ''}
                className="input"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">License expiry</label>
              <input
                name="license_expiry"
                type="date"
                defaultValue={initialData?.license_expiry ?? ''}
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Base salary</label>
              <input
                name="salary_base"
                type="number"
                step="0.01"
                defaultValue={initialData?.salary_base ?? 0}
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                name="status"
                defaultValue={initialData?.status ?? 'available'}
                className="select"
              >
                <option value="available">Available</option>
                <option value="on_trip">On trip</option>
                <option value="on_leave">On leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Emergency contact</label>
              <input
                name="emergency_contact"
                defaultValue={initialData?.emergency_contact ?? ''}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Address</label>
              <textarea
                name="address"
                defaultValue={initialData?.address ?? ''}
                className="textarea"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                defaultValue={initialData?.notes ?? ''}
                className="textarea"
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData?.id ? 'Update driver' : 'Create driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}