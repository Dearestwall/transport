'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { saveClientAction } from '@/actions/clients'

type ClientRow = {
  id?: string
  company_name?: string | null
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  gst_number?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  notes?: string | null
}

interface ClientModalProps {
  open: boolean
  onClose: () => void
  initialData?: ClientRow | null
}

export default function ClientModal({
  open,
  onClose,
  initialData,
}: ClientModalProps) {
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
              {initialData?.id ? 'Edit client' : 'Add client'}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Save client profile, GST, address, and contact details.
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

        <form action={saveClientAction} className="space-y-5 p-5">
          <input type="hidden" name="id" defaultValue={initialData?.id ?? ''} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Company name</label>
              <input
                name="company_name"
                defaultValue={initialData?.company_name ?? ''}
                className="input"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Contact person</label>
              <input
                name="contact_person"
                defaultValue={initialData?.contact_person ?? ''}
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                name="phone"
                defaultValue={initialData?.phone ?? ''}
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={initialData?.email ?? ''}
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">GST number</label>
              <input
                name="gst_number"
                defaultValue={initialData?.gst_number ?? ''}
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <input
                name="city"
                defaultValue={initialData?.city ?? ''}
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">State</label>
              <input
                name="state"
                defaultValue={initialData?.state ?? ''}
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
              {initialData?.id ? 'Update client' : 'Create client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}